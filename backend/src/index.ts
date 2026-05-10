import express from 'express';
import cors from 'cors';
import authRouter from './auth/auth.routes.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req, res)=>{
    res.send("Hello from server");
});
app.use("/api/auth",authRouter);

app.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`);
});