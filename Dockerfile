# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY TaskManagementSystem/TaskManagementSystem.csproj TaskManagementSystem/
RUN dotnet restore TaskManagementSystem/TaskManagementSystem.csproj

# Copy everything else and build
COPY TaskManagementSystem/ TaskManagementSystem/
WORKDIR /src/TaskManagementSystem
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 8080
EXPOSE 8081

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Create data directory for SQLite
RUN mkdir -p /app/data

# Run the app
ENTRYPOINT ["dotnet", "TaskManagementSystem.dll"]

