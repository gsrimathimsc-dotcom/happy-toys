# Builds the API into a container for online hosting.
# Stage 1: compile the code with the .NET SDK.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY HappyToys.Domain/HappyToys.Domain.csproj HappyToys.Domain/
COPY HappyToys.Application/HappyToys.Application.csproj HappyToys.Application/
COPY HappyToys.Infrastructure/HappyToys.Infrastructure.csproj HappyToys.Infrastructure/
COPY HappyToys.API/HappyToys.API.csproj HappyToys.API/
RUN dotnet restore HappyToys.API/HappyToys.API.csproj
COPY . .
RUN dotnet publish HappyToys.API/HappyToys.API.csproj -c Release -o /app

# Stage 2: run it on a small image that contains only the ASP.NET runtime.
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "HappyToys.API.dll"]
