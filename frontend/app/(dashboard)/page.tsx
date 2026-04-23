export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-relay-card">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 bg-relay-accent/10 text-relay-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        </div>
        <h1 className="text-xl font-bold text-relay-text-primary tracking-tight">
          Welcome to Relay
        </h1>
        <p className="text-[13px] text-relay-text-secondary leading-relaxed">
          Select a conversation from the sidebar to start chatting. 
          You can update your profile by clicking your avatar in the bottom left.
        </p>
      </div>
    </div>
  );
}
