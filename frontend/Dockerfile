FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend code
COPY . .

# Build the frontend application
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]
