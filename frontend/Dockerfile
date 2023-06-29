# Stage 1: Build the React project
FROM node:16

WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

EXPOSE 8877

# Build the React project
CMD ["npm", "run", "dev"]