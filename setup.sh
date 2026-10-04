#!/bin/bash

# Boy-ly Trading Signals Platform Setup Script
# This script automates the setup process

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

REQUIREMENTS=("node" "npm" "git" "docker" "docker-compose")
MISSING=()

for req in "${REQUIREMENTS[@]}"; do
    if ! command_exists "$req"; then
        MISSING+=("$req")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    print_warning "Missing requirements: ${MISSING[*]}"
    print_warning "Please install them before proceeding."
    exit 1
fi

print_success "All prerequisites are installed."

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install root dependencies"
        exit 1
    fi
    
    # Server dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install server dependencies"
        exit 1
    fi
    cd ..
    
    # Client dependencies
    print_status "Installing client dependencies..."
    cd client
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install client dependencies"
        exit 1
    fi
    cd ..
    
    print_success "All dependencies installed successfully."
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Server environment
    if [ ! -f "server/.env" ]; then
        cp server/.env.example server/.env
        print_status "Created server/.env from template"
    else
        print_status "server/.env already exists, skipping"
    fi
    
    # Client environment
    if [ ! -f "client/.env" ]; then
        cp client/.env.example client/.env
        print_status "Created client/.env from template"
    else
        print_status "client/.env already exists, skipping"
    fi
    
    print_success "Environment files setup complete."
}

# Function to generate secrets
generate_secrets() {
    print_status "Generating secrets..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    JWT_RESET_SECRET=$(openssl rand -base64 32)
    
    # Update server .env
    if [ -f "server/.env" ]; then
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" server/.env
        sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" server/.env
        sed -i "s/JWT_RESET_SECRET=.*/JWT_RESET_SECRET=$JWT_RESET_SECRET/" server/.env
        print_status "Updated JWT secrets in server/.env"
    fi
    
    print_success "Secrets generated successfully."
}

# Function to setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB..."
    
    # Check if MongoDB is running
    if ! command_exists "mongod"; then
        print_warning "MongoDB is not installed locally."
        print_status "Starting MongoDB with Docker..."
        docker run -d -p 27017:27017 --name boy-ly-mongodb mongo:6
        
        # Wait for MongoDB to start
        sleep 10
        
        # Check if container is running
        if docker ps | grep -q "boy-ly-mongodb"; then
            print_success "MongoDB started with Docker"
        else
            print_error "Failed to start MongoDB with Docker"
            exit 1
        fi
    else
        print_status "Checking if MongoDB is running locally..."
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB is already running"
        else
            print_status "Starting MongoDB..."
            mongod --dbpath /data/db --fork
            if [ $? -eq 0 ]; then
                print_success "MongoDB started successfully"
            else
                print_error "Failed to start MongoDB"
                exit 1
            fi
        fi
    fi
    
    # Create database
    print_status "Creating database..."
    mongosh localhost:27017 --eval "use boy-ly-trading" > /dev/null 2>&1
    print_success "Database created or already exists."
}

# Function to start development servers
start_dev() {
    print_status "Starting development servers..."
    
    # Start server in background
    print_status "Starting backend server..."
    cd server
    npm run dev &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 5
    
    # Check if server is running
    if curl -s http://localhost:5000/api/health > /dev/null; then
        print_success "Backend server is running on http://localhost:5000"
    else
        print_error "Failed to start backend server"
        kill $SERVER_PID
        exit 1
    fi
    
    # Start client in background
    print_status "Starting frontend..."
    cd client
    npm start &
    CLIENT_PID=$!
    cd ..
    
    # Wait for client to start
    sleep 10
    
    # Check if client is running
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is running on http://localhost:3000"
    else
        print_warning "Frontend may take longer to start"
    fi
    
    print_success "Development servers are running!"
    print_status "Press Ctrl+C to stop both servers"
    
    # Wait for both processes
    wait $SERVER_PID $CLIENT_PID
}

# Function to build production
build_production() {
    print_status "Building for production..."
    
    # Build client
    print_status "Building client..."
    cd client
    npm run build
    if [ $? -ne 0 ]; then
        print_error "Failed to build client"
        exit 1
    fi
    cd ..
    
    # Copy build files to server
    print_status "Copying build files to server..."
    if [ ! -d "server/public" ]; then
        mkdir -p server/public
    fi
    cp -r client/build/* server/public/
    
    print_success "Production build complete."
}

# Function to start production
start_production() {
    print_status "Starting production server..."
    
    cd server
    npm start
    cd ..
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Stop MongoDB Docker container
    if docker ps | grep -q "boy-ly-mongodb"; then
        docker stop boy-ly-mongodb
        docker rm boy-ly-mongodb
        print_status "Stopped MongoDB Docker container"
    fi
    
    # Kill processes
    pkill -f "node.*server/src/index.js"
    pkill -f "npm.*start"
    
    print_success "Cleanup complete."
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  install       - Install all dependencies"
    echo "  setup         - Setup environment files and secrets"
    echo "  mongodb       - Setup MongoDB"
    echo "  dev          - Start development servers"
    echo "  build        - Build for production"
    echo "  start        - Start production server"
    echo "  docker       - Start with Docker"
    echo "  cleanup      - Clean up resources"
    echo "  all          - Run full setup (install + setup + mongodb + dev)"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all          # Full setup and start development"
    echo "  $0 install      # Install dependencies only"
    echo "  $0 dev         # Start development servers"
}

# Main script logic
case "$1" in
    install)
        install_dependencies
        ;;
    setup)
        setup_environment
        generate_secrets
        ;;
    mongodb)
        setup_mongodb
        ;;
    dev)
        install_dependencies
        setup_environment
        generate_secrets
        setup_mongodb
        start_dev
        ;;
    build)
        install_dependencies
        build_production
        ;;
    start)
        start_production
        ;;
    docker)
        print_status "Starting with Docker..."
        docker-compose up -d
        print_success "Docker containers started"
        ;;
    cleanup)
        cleanup
        ;;
    all)
        install_dependencies
        setup_environment
        generate_secrets
        setup_mongodb
        start_dev
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

exit 0
