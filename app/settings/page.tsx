"use client"

export default function SettingsPage() {
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE ?? "true"
  return (
    <main className="container mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="text-sm">
        <div>
          <span className="font-medium">Demo Mode:</span> {demo === "true" ? "Enabled" : "Disabled"}
        </div>
        <p className="mt-2 text-muted-foreground">
          This prototype uses simulated data only and does not connect to live signalling or TMS.
        </p>
      </div>
    </main>
  )
}
