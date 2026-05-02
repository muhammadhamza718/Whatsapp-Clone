---
id: 54
title: "Fix: SignalR Reconnect Loop and Modal Scrollbar Visibility"
stage: misc
date_iso: 2026-05-02
surface: agent
model: Gemini 1.5 Pro
feature: none
branch: main
user: Hamza
command: none
labels: ["signalr", "bugfix", "css", "scrollbar"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - f:\Courses\Hamza\WhatsApp Clone\backend\Program.cs
  - f:\Courses\Hamza\WhatsApp Clone\frontend\app\globals.css
---

## PROMPT_TEXT
Now its working properly 
and now in profile settings there is scroll bar but the scroll bar is not visible properly
and this is keep disconnecting and connecting
SignalR hub connected — broadcasting to 1 client
SignalR disconnected — trying to reconnect...

## RESPONSE_TEXT
I investigated both issues using systematic debugging. 
For SignalR: I found that `Program.cs` was using the fallback connection string from `appsettings.json` to enable Redis, which caused the HubLifetimeManager to fail in production. I updated it to explicitly check `Environment.GetEnvironmentVariable("REDIS_URL")`.
For the Scrollbar: The custom `.modal-scroll` CSS class was too thin (4px) and used the accent color which blended into the dark background. I updated it to 6px and applied `var(--relay-border-strong)` for better contrast.

## OUTCOME
SignalR connection loop prevented in production. Modal scrollbar made properly visible. Changes are ready to be pushed to Vercel/Railway.
