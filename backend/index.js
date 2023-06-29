import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 8999;
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());
app.use(cors());

app.get("/api/bills", async (req, res) => {
  try {
    const query = `
      SELECT o.*, u.name, u.email, u.phone, u.balance
      FROM orders AS o
      INNER JOIN users AS u ON o.user_id = u.id
      WHERE o.payment_status = 'pending'
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post('/api/bills/:orderId/approve', (req, res) => {
  const orderId = req.params.orderId;
  const approvedAmount = req.body.amount;

  // Logic to update the order status and approved amount in the database
  // ...

  // Return a success response
  res.status(200).json({ message: 'Order approved successfully.' });
});

app.delete("/api/bills/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
