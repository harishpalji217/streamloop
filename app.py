import subprocess
import os
import sys
import time

print("=== Starting StreamLoop on Hugging Face Spaces ===")

# Set environment variables for Next.js
os.environ["PORT"] = "7860"
os.environ["NODE_ENV"] = "production"

# Install dependencies if needed
if not os.path.exists("node_modules"):
    print("Installing npm dependencies...")
    subprocess.run(["npm", "install", "--include=dev"], check=True)

# Ensure upload and prisma folders exist
os.makedirs("public/uploads", exist_ok=True)
os.makedirs("prisma", exist_ok=True)

# Sync database schema
print("Syncing Prisma SQLite schema...")
subprocess.run(["npx", "prisma", "db", "push", "--accept-data-loss"], check=True)

# Build Next.js if .next does not exist
if not os.path.exists(".next"):
    print("Building Next.js production build...")
    subprocess.run(["npm", "run", "build"], check=True)

print("Launching StreamLoop on port 7860...")
sys.stdout.flush()

# Start Next.js server on port 7860
proc = subprocess.Popen(["npm", "start", "--", "-p", "7860"])
proc.wait()
