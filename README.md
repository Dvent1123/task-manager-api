
# task-manager-api

This is the api for a MERN stack web app deployed on 
Digital Ocean. I wanted to make this as a version of a simple to-do
list but with my own twist. A user can register and that automatically 
makes them the admin for their project. They can also add users by making
an account for them and each user can be assigned a task which they will see
on their dashboard. The app uses SocketIO to receive real time data so all users
can update the information in real time. 
## Authors

- [@danielventura](https://github.com/Dvent1123)
- [@brentynhanna](https://github.com/Brehtyn)

  
## Demo

   - [Todo Simply](todo-simply.com)

## Tech Stack

**Client:** React, SCSS, Axios, SocketIO-Client, JWT-Decode

**Server:** Node, Express, MongoDB, JWT, SocketIO

  
## Function Reference

#### createJWT(username, id, room, role, duration)
Creates, signs, and returns a JWT token

#### isEmpty()
Checks the length of string and white space and returns
boolean value.
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`NODE_ENV`

`PORT`

`HTTP_PORT`

`CLIENT_URL`

`DATABASE_URI`

`TOKEN_SECRET`



  
## Deployment
Deployment was done on Digital Ocean through
and Ubuntu droplet. The server deployment is similar
to the Client

To deploy this project:

SSH into your Digital Ocean Droplet using
```bash
ssh admin@DropletIP
```
Use sudo to clone the respository
```bash
sudo git clone @RepositoryLink
```
```bash
sudo npm install
```

You must still configure NGINX and PM2 for this project to
work on your server.
  
## Run Locally

Make a directory for the project or cd into the project
directory that was made while cloning the client.

```bash
mkdir my-project
```

AND/OR

Go to the project directory

```bash
  cd my-project
```

Make a directory for the client and server if not already made

```bash
mkdir client
mkdir server
```

Go into the server directory

```bash
cd server
```

Clone the project into the project directory

```bash
  git clone https://github.com/Dvent1123/task-manager-api.git
```

Install dependencies

```bash
  npm install
```

Start the project

```bash
  npm start
```

  
