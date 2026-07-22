# Stage 1: SPA Angular build
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency definition files
COPY package.json package-lock.json ./

# Install only the dependencies needed for the build
RUN npm ci

# Copy the rest of the source code
COPY . .

# Compile the application in production mode
RUN npm run build -- --configuration=production

# Stage 2: Ultra-light Nginx server
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx files and copy the compiled files from the previous stage
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/ng-cookbook/browser /usr/share/nginx/html

# Expose port 80 of the container
EXPOSE 80

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
