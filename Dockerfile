FROM node:9.9.0
ARG VERSION_TAG
RUN git clone -b $VERSION_TAG https://github.com/DuoSoftware/DVP-ArticleService.git /usr/local/src/articleservice
RUN cd /usr/local/src/articleservice
WORKDIR /usr/local/src/articleservic
COPY ./package.json ./
RUN npm install
COPY . .
EXPOSE 3635
CMD [ "node", "/usr/local/src/articleservice/app.js" ]

