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

app.get("/api/orders/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const query = `
      SELECT id, created_at, payment_status FROM orders WHERE user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

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

app.post("/api/bills/:orderId/approve", async (req, res) => {
  const orderId = req.params.orderId;
  const approvedAmount = req.body.amount;

  try {
    // Get the existing order details from the database
    const getOrderQuery = `
      SELECT * FROM orders WHERE id = $1
    `;
    const getOrderValues = [orderId];
    const { rows } = await pool.query(getOrderQuery, getOrderValues);
    const order = rows[0];

    // Check if the order exists and is in a pending status
    if (!order || order.payment_status !== "pending") {
      return res
        .status(400)
        .json({ error: "Invalid order or order is not pending." });
    }

    // Update the order status and add the approved amount to the user's balance
    const updateOrderQuery = `
      UPDATE orders
      SET payment_status = $1
      WHERE id = $2
    `;
    const updateOrderValues = ["Success", orderId];
    await pool.query(updateOrderQuery, updateOrderValues);

    // Get the user's existing balance from the database
    const getUserQuery = `
      SELECT * FROM users WHERE id = $1
    `;
    const getUserValues = [order.user_id];
    const userResult = await pool.query(getUserQuery, getUserValues);
    const user = userResult.rows[0];

    // Update the user's balance by adding the approved amount
    const updatedBalance =
      parseFloat(user.balance) + parseFloat(approvedAmount);
    const updateUserQuery = `
      UPDATE users
      SET balance = $1
      WHERE id = $2
    `;
    const updateUserValues = [updatedBalance, order.user_id];
    await pool.query(updateUserQuery, updateUserValues);

    res.status(200).json({ message: "Order approved successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.delete("/api/bills/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    await pool.query("DELETE FROM orders WHERE id = $1", [orderId]);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
