from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body, Path, Query
import uvicorn
import os
import time
import jwt
from .simulator import DemoSimulator

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ISSUER = os.getenv("OIDC_ISSUER", "demo-issuer")

app = FastAPI(title='AI Train Traffic - Prototype')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sim = DemoSimulator()

@app.get('/api/health')
async def health():
    return { 'status': 'ok', 'demo_mode': DEMO_MODE }

@app.post('/api/auth/login')
async def login(email: str = Body(...), role: str = Body("Observer")):
    # demo-only JWT (HS256)
    now = int(time.time())
    claims = {
        "sub": email,
        "role": role,
        "iat": now,
        "exp": now + 3600,
        "iss": JWT_ISSUER,
        "scope": "read write",
    }
    token = jwt.encode(claims, JWT_SECRET, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

@app.get('/api/kpis')
async def kpis():
    return sim.kpis()

@app.get('/api/section/{section_id}/status')
async def section_status(section_id: str = Path(...)):
    return {"section_id": section_id, "positions": sim.get_positions(), "conflicts": []}

@app.post('/api/optimize')
async def optimize():
    rec = sim.generate_recommendation()
    return rec

@app.post('/api/simulate')
async def simulate(train_id: str = Body(...), delay_min: float = Body(...)):
    # demo: log only; sim loop already ticking
    sim.log_audit("simulate_called", {"train_id": train_id, "delay_min": delay_min})
    return {"status": "started"}

@app.get('/api/recommendations/active')
async def recommendations_active():
    return {"recommendation": sim.active_recommendation}

@app.post('/api/recommendation/{rec_id}/accept')
async def accept_rec(rec_id: str = Path(...)):
    return sim.accept_recommendation(rec_id)

@app.post('/api/recommendation/{rec_id}/request_supervisor')
async def request_supervisor(rec_id: str = Path(...)):
    if sim.active_recommendation and sim.active_recommendation['id'] == rec_id:
        ticket = sim.request_approval(sim.active_recommendation)
        return ticket
    return {"status": "not_found"}

@app.get('/api/approvals/pending')
async def approvals_pending():
    return {"tickets": [t for t in sim.pending_tickets.values() if t["status"] == "PENDING"]}

@app.post('/api/approval/{ticket_id}/approve')
async def approve(ticket_id: str = Path(...), comment: str = Body("Approved")):
    t = sim.approve_ticket(ticket_id, approved=True, comment=comment)
    return t or {"status": "not_found"}

@app.post('/api/approval/{ticket_id}/reject')
async def reject(ticket_id: str = Path(...), comment: str = Body("Rejected")):
    t = sim.approve_ticket(ticket_id, approved=False, comment=comment)
    return t or {"status": "not_found"}

@app.get('/api/audit')
async def audit(limit: int = Query(50)):
    return {"entries": sim.audit[-limit:]}

@app.get('/api/model/version')
async def model_version():
    # demo version info
    return {"name": "heuristic-v0", "hash": "demo123", "deployed_at": int(time.time())}

@app.get('/api/trains')
async def get_trains():
    """Get all trains with detailed information"""
    return {"trains": list(sim.trains.values())}

@app.get('/api/tracks')
async def get_tracks():
    """Get all tracks with current status"""
    return {"tracks": list(sim.tracks.values())}

@app.post('/api/train/{train_id}/control')
async def control_train(train_id: str = Path(...), action: str = Body(...), value: float = Body(None)):
    """Control individual train (speed, stop, start)"""
    if train_id not in sim.trains:
        return {"error": "Train not found"}
    
    train = sim.trains[train_id]
    
    if action == "speed":
        train['speed'] = max(0, min(train['max_speed'], value))
        sim.log_audit('train_speed_changed', {'train': train_id, 'new_speed': value})
    elif action == "stop":
        train['status'] = 'stopped'
        train['speed'] = 0
        sim.log_audit('train_stopped', {'train': train_id})
    elif action == "start":
        train['status'] = 'running'
        sim.log_audit('train_started', {'train': train_id})
    
    return {"status": "success", "train": train}

@app.get('/api/system/status')
async def system_status():
    """Get comprehensive system status"""
    return {
        "trains": list(sim.trains.values()),
        "tracks": list(sim.tracks.values()),
        "metrics": sim.system_metrics,
        "active_conflicts": len(sim._detect_all_conflicts()),
        "timestamp": time.time()
    }

@app.post('/api/simulation/event')
async def trigger_event(event_type: str = Body(...), data: dict = Body({})):
    """Manually trigger simulation events"""
    if event_type == "add_train":
        # Add a new train dynamically
        new_id = f"T{len(sim.trains) + 1}"
        sim.trains[new_id] = {
            'id': new_id, 'label': f'Train {new_id}', 'type': 'passenger',
            'route': [[20.0, 74.0], [20.0, 74.5], [20.0, 75.0]], 
            'idx': 0, 'speed': 40, 'max_speed': 70, 'priority': 'medium',
            'passengers': 200, 'status': 'running', 'delay': 0
        }
        sim.log_audit('train_added', {'train': new_id})
        return {"status": "success", "train": sim.trains[new_id]}
    
    elif event_type == "emergency_stop":
        # Emergency stop all trains
        for train in sim.trains.values():
            train['status'] = 'emergency_stop'
            train['speed'] = 0
        sim.log_audit('emergency_stop', {'reason': 'manual_trigger'})
        return {"status": "success", "message": "All trains stopped"}
    
    return {"error": "Unknown event type"}

@app.websocket('/ws/sim')
async def websocket_sim(ws: WebSocket):
    await ws.accept()
    client = sim.register_client(ws)
    try:
        # initial positions
        await client.send_json({'type':'positions', 'payload': sim.get_positions()})
        while True:
            msg = await ws.receive_json()
            t = msg.get('type')
            if t == 'subscribe':
                await client.send_json({'type':'positions', 'payload': sim.get_positions()})
            elif t == 'request_approval':
                payload = msg.get('payload')
                ticket = sim.request_approval(payload)
                await client.send_json({'type':'recommendation', 'payload': ticket})
            else:
                await client.send_json({'type':'audit', 'payload': {'action':'unknown_message'}})
    except WebSocketDisconnect:
        sim.unregister_client(client)

if __name__ == '__main__':
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=True)
