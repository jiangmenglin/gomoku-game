FROM node:18-alpine AS build
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

FROM node:18-alpine
RUN apk add --no-cache tini
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=build /app/client/build ./client/build
EXPOSE 22
ENV NODE_ENV=production
ENV PORT=22
WORKDIR /app/server
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/app.js"]
