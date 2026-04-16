# Use Node.js LTS version
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads/products

# Expose port
EXPOSE 5001

# Run the app
CMD ["npm", "start"]
