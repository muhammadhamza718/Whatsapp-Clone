# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the backend project files
COPY ["backend/ChatApp.Api.csproj", "backend/"]

# Restore dependencies
RUN dotnet restore "backend/ChatApp.Api.csproj"

# Copy the rest of the backend source code
COPY backend/ backend/

# Build and publish
WORKDIR "/src/backend"
RUN dotnet publish "ChatApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose the port (Railway/Render will override via PORT env var)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ChatApp.Api.dll"]
