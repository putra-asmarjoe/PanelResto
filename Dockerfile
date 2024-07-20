FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Add wait-for-it.sh script
COPY wait-for-it.sh /usr/src/app/wait-for-it.sh
RUN chmod +x /usr/src/app/wait-for-it.sh

EXPOSE 3000

CMD ["./wait-for-it.sh", "db:3306", "--", "npm", "start"]
