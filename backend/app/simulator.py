import asyncio
import json
import time
import uuid
import random
from typing import Dict, Any

class ClientWrapper:
    def __init__(self, ws):
        self.ws = ws
    async def send_json(self, msg: Dict[str, Any]):
        await self.ws.send_text(json.dumps(msg))

class DemoSimulator:
    def __init__(self):
        # Enhanced train system with more realistic data
        self.trains: Dict[str, Dict[str, Any]] = {
            'T1': {
                'id': 'T1', 'label': 'Express 101', 'type': 'passenger',
                'route': [[20.0,74.5],[20.0,75.0],[20.0,75.5],[20.0,76.0]], 
                'idx': 0, 'speed': 60, 'max_speed': 80, 'priority': 'high',
                'passengers': 450, 'status': 'running', 'delay': 0
            },
            'T2': {
                'id': 'T2', 'label': 'Freight 202', 'type': 'freight',
                'route': [[19.8,75.5],[20.0,75.0],[20.2,74.5],[20.4,74.0]], 
                'idx': 0, 'speed': 50, 'max_speed': 60, 'priority': 'medium',
                'cargo': 'containers', 'status': 'running', 'delay': 0
            },
            'T3': {
                'id': 'T3', 'label': 'Local 303', 'type': 'passenger',
                'route': [[20.1,74.0],[20.0,74.5],[20.0,75.0],[20.0,75.5]], 
                'idx': 0, 'speed': 45, 'max_speed': 70, 'priority': 'low',
                'passengers': 120, 'status': 'running', 'delay': 0
            }
        }
        
        # Dynamic track system
        self.tracks = {
            'B1': {'id': 'B1', 'from': [20.0, 74.5], 'to': [20.0, 75.0], 'status': 'free', 'capacity': 1, 'speed_limit': 80},
            'B2': {'id': 'B2', 'from': [20.0, 75.0], 'to': [20.0, 75.5], 'status': 'free', 'capacity': 1, 'speed_limit': 80},
            'B3': {'id': 'B3', 'from': [20.0, 75.5], 'to': [20.0, 76.0], 'status': 'free', 'capacity': 1, 'speed_limit': 80},
            'B4': {'id': 'B4', 'from': [19.8, 75.5], 'to': [20.0, 75.0], 'status': 'free', 'capacity': 1, 'speed_limit': 60},
            'B5': {'id': 'B5', 'from': [20.0, 75.0], 'to': [20.2, 74.5], 'status': 'free', 'capacity': 1, 'speed_limit': 60}
        }
        
        self.clients = set()
        self.audit = []
        self.active_recommendation = None
        self.pending_tickets: Dict[str, Any] = {}
        self.system_metrics = {
            'total_trains': len(self.trains),
            'active_conflicts': 0,
            'system_load': 0.0,
            'efficiency_score': 1.0
        }
        
        # Start real-time simulation
        loop = asyncio.get_event_loop()
        loop.create_task(self._tick())
        loop.create_task(self._update_metrics())
        loop.create_task(self._generate_events())

    def register_client(self, ws):
        c = ClientWrapper(ws)
        self.clients.add(c)
        return c

    def unregister_client(self, client):
        self.clients.discard(client)

    def get_positions(self):
        out = {}
        for k,v in self.trains.items():
            route = v['route']
            idx = v['idx']
            pos = route[idx]
            out[k] = { 'id':k, 'label': v['label'], 'route': route, 'position': pos, 'speed': v['speed'], 'next_section':'secX' }
        return out

    async def _tick(self):
        # Real-time train movement simulation
        while True:
            await asyncio.sleep(1.0)  # Faster updates for more dynamic feel
            
            # Update train positions with realistic movement
            for train_id, train in self.trains.items():
                if train['status'] == 'running':
                    # Calculate movement based on speed and track conditions
                    current_pos = train['route'][train['idx']]
                    next_idx = min(len(train['route'])-1, train['idx']+1)
                    next_pos = train['route'][next_idx]
                    
                    # Check for conflicts before moving
                    conflicts = self._check_track_conflicts(train_id, next_pos)
                    if conflicts:
                        # Handle conflict - slow down or stop
                        train['speed'] = max(10, train['speed'] * 0.5)
                        train['delay'] += 1
                        self.log_audit('conflict_detected', {
                            'train': train_id, 
                            'conflicts': conflicts,
                            'action': 'speed_reduced'
                        })
                    else:
                        # Normal movement
                        train['idx'] = next_idx
                        train['speed'] = min(train['max_speed'], train['speed'] + 5)
                        train['delay'] = max(0, train['delay'] - 0.5)
                    
                    # Update track status
                    self._update_track_status(train_id, current_pos)
            
            # Broadcast real-time updates
            await self.broadcast_positions()
            await self.broadcast_track_status()
            
            # Generate recommendations based on real-time conditions
            conflicts = self._detect_all_conflicts()
            if conflicts and not self.active_recommendation:
                rec = self.generate_recommendation()
                self.active_recommendation = rec
                await self.broadcast({'type':'recommendation','payload':rec})

    async def broadcast_positions(self):
        payload = self.get_positions()
        await self.broadcast({'type':'positions','payload':payload})

    async def broadcast(self, msg):
        for c in list(self.clients):
            try:
                await c.send_json(msg)
            except Exception:
                self.unregister_client(c)

    def generate_recommendation(self):
        # Enhanced AI logic for train optimization
        positions = self.get_positions()
        trains = list(positions.values())
        
        # Check for conflicts and generate intelligent recommendations
        conflicts = self._detect_conflicts(trains)
        
        if conflicts:
            # Generate conflict-based recommendation
            conflict = conflicts[0]  # Take first conflict
            if len(conflict['trains']) >= 2:
                train1, train2 = conflict['trains'][0], conflict['trains'][1]
                summary = f'Hold {train2}; allow {train1} to pass via primary route'
                time_saved = 8.2  # Estimated time saved
            else:
                summary = f'Adjust speed for {conflict["trains"][0]} to avoid congestion'
                time_saved = 3.1
        else:
            # Proactive optimization
            summary = 'Optimize train spacing for improved throughput'
            time_saved = 4.5
        
        rec = { 
            'id': str(uuid.uuid4()), 
            'summary': summary, 
            'metric': { 'time_saved_min': time_saved },
            'created_at': time.time(), 
            'status': 'SUGGESTED',
            'confidence': 0.87,
            'conflicts_detected': len(conflicts)
        }
        self.log_audit('recommendation_generated', rec)
        return rec
    
    def _detect_conflicts(self, trains):
        """Detect potential conflicts between trains"""
        conflicts = []
        
        # Simple conflict detection based on proximity
        for i, train1 in enumerate(trains):
            for j, train2 in enumerate(trains[i+1:], i+1):
                pos1 = train1['position']
                pos2 = train2['position']
                
                # Calculate distance between trains
                distance = ((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)**0.5
                
                if distance < 0.1:  # Very close - potential conflict
                    conflicts.append({
                        'trains': [train1['id'], train2['id']],
                        'distance': distance,
                        'severity': 'high' if distance < 0.05 else 'medium'
                    })
        
        return conflicts

    def request_approval(self, payload):
        ticket_id = str(uuid.uuid4())
        ticket = { 'ticket_id': ticket_id, 'payload': payload, 'status': 'PENDING', 'created_at':time.time() }
        self.pending_tickets[ticket_id] = ticket
        self.log_audit('approval_requested', ticket)
        return ticket

    def accept_recommendation(self, rec_id, user='controller'):
        if self.active_recommendation and self.active_recommendation['id'] == rec_id:
            self.active_recommendation['status'] = 'ACCEPTED'
            self.log_audit('recommendation_accepted', {'rec_id': rec_id, 'by': user})
            return {'status':'ok'}
        return {'status':'not_found'}

    def approve_ticket(self, ticket_id, approved=True, comment=""):
        t = self.pending_tickets.get(ticket_id)
        if not t:
            return None
        t['status'] = 'APPROVED' if approved else 'REJECTED'
        t['comment'] = comment
        self.log_audit('ticket_' + ('approved' if approved else 'rejected'), t)
        return t

    def kpis(self):
        # Enhanced KPIs with real-time calculations
        positions = self.get_positions()
        trains = list(positions.values())
        conflicts = self._detect_conflicts(trains)
        
        # Calculate dynamic KPIs based on current state
        total_trains = len(trains)
        active_conflicts = len(conflicts)
        
        # Punctuality decreases with conflicts
        base_punctuality = 0.95
        punctuality = max(0.7, base_punctuality - (active_conflicts * 0.05))
        
        # Average delay increases with conflicts
        base_delay = 2.1
        avg_delay = base_delay + (active_conflicts * 1.8)
        
        # Throughput decreases with conflicts
        base_throughput = 22.0
        throughput = max(8.0, base_throughput - (active_conflicts * 2.5))
        
        # Utilization based on active trains
        utilization = min(0.95, (total_trains / 3.0) * 0.8)  # Assuming 3 is max capacity
        
        return {
            'punctuality': round(punctuality, 2),
            'avg_delay_min': round(avg_delay, 1),
            'throughput_trains_per_hr': round(throughput, 1),
            'utilization_pct': round(utilization, 2),
            'active_conflicts': active_conflicts,
            'safety_score': round(max(0.6, 1.0 - (active_conflicts * 0.15)), 2),
            'efficiency_score': round(max(0.5, 1.0 - (active_conflicts * 0.1)), 2)
        }

    def _check_track_conflicts(self, train_id, position):
        """Check for conflicts at a specific position"""
        conflicts = []
        for other_train_id, other_train in self.trains.items():
            if other_train_id != train_id and other_train['status'] == 'running':
                other_pos = other_train['route'][other_train['idx']]
                distance = ((position[0] - other_pos[0])**2 + (position[1] - other_pos[1])**2)**0.5
                if distance < 0.05:  # Very close - potential conflict
                    conflicts.append({
                        'train': other_train_id,
                        'distance': distance,
                        'severity': 'high' if distance < 0.02 else 'medium'
                    })
        return conflicts
    
    def _update_track_status(self, train_id, position):
        """Update track status based on train position"""
        for track_id, track in self.tracks.items():
            dist_to_start = ((position[0] - track['from'][0])**2 + (position[1] - track['from'][1])**2)**0.5
            dist_to_end = ((position[0] - track['to'][0])**2 + (position[1] - track['to'][1])**2)**0.5
            
            if dist_to_start < 0.1 or dist_to_end < 0.1:
                track['status'] = 'occupied'
                track['occupied_by'] = train_id
            else:
                track['status'] = 'free'
                track.pop('occupied_by', None)
    
    def _detect_all_conflicts(self):
        """Detect all current conflicts in the system"""
        all_conflicts = []
        for train_id, train in self.trains.items():
            if train['status'] == 'running':
                conflicts = self._check_track_conflicts(train_id, train['route'][train['idx']])
                all_conflicts.extend(conflicts)
        return all_conflicts
    
    async def broadcast_track_status(self):
        """Broadcast current track status to all clients"""
        await self.broadcast({'type': 'tracks', 'payload': list(self.tracks.values())})
    
    async def _update_metrics(self):
        """Continuously update system metrics"""
        while True:
            await asyncio.sleep(2.0)
            
            # Calculate real-time metrics
            active_trains = sum(1 for t in self.trains.values() if t['status'] == 'running')
            conflicts = self._detect_all_conflicts()
            occupied_tracks = sum(1 for t in self.tracks.values() if t['status'] == 'occupied')
            
            self.system_metrics.update({
                'active_trains': active_trains,
                'active_conflicts': len(conflicts),
                'system_load': occupied_tracks / len(self.tracks),
                'efficiency_score': max(0.1, 1.0 - (len(conflicts) * 0.2))
            })
            
            # Broadcast metrics update
            await self.broadcast({'type': 'metrics', 'payload': self.system_metrics})
    
    async def _generate_events(self):
        """Generate random events to make the system more dynamic"""
        while True:
            await asyncio.sleep(random.uniform(10, 30))  # Random intervals
            
            # Random events
            event_type = random.choice(['delay', 'speed_change', 'new_train', 'maintenance'])
            
            if event_type == 'delay':
                train_id = random.choice(list(self.trains.keys()))
                delay_minutes = random.randint(2, 10)
                self.trains[train_id]['delay'] += delay_minutes
                self.log_audit('random_delay', {
                    'train': train_id,
                    'delay_minutes': delay_minutes,
                    'reason': 'operational_delay'
                })
            
            elif event_type == 'speed_change':
                train_id = random.choice(list(self.trains.keys()))
                speed_change = random.randint(-10, 10)
                new_speed = max(20, min(self.trains[train_id]['max_speed'], 
                                      self.trains[train_id]['speed'] + speed_change))
                self.trains[train_id]['speed'] = new_speed
                self.log_audit('speed_adjustment', {
                    'train': train_id,
                    'new_speed': new_speed,
                    'change': speed_change
                })
            
            # Broadcast event
            await self.broadcast({'type': 'event', 'payload': {
                'type': event_type,
                'timestamp': time.time(),
                'description': f'{event_type} event occurred'
            }})

    def log_audit(self, action, payload):
        entry = { 'ts': time.time(), 'action': action, 'payload': payload }
        self.audit.append(entry)
        self.audit = self.audit[-1000:]
