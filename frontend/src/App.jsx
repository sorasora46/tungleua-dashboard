import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const BillTable = () => {
  const [bills, setBills] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get("https://dashapi.sorrakw.com/api/bills");
      setBills(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeny = (orderId) => {
    setSelectedOrderId(orderId);
    setConfirmationModalOpen(true);
  };

  const handleApprove = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `https://dashapi.sorrakw.com/api/bills/${selectedOrderId}/approve`,
        { amount }
      );
      fetchBills();
      setModalOpen(false);
      setAmount("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setAmount("");
  };

  const handleConfirmationModalConfirm = async () => {
    try {
      await axios.delete(
        `https://dashapi.sorrakw.com/api/bills/${selectedOrderId}`
      );
      fetchBills();
      setConfirmationModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmationModalCancel = () => {
    setConfirmationModalOpen(false);
  };

  const formatDate = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
      hour12: false,
    };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUserIdFilter = (e) => {
    setUserIdFilter(e.target.value);
  };

  const handleDateFilter = (e) => {
    setDateFilter(e.target.value);
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.user_id.includes(userIdFilter) &&
      bill.created_at.includes(dateFilter)
  );

  const filteredAndSearchedBills = filteredBills.filter((bill) =>
    bill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="table-container">
      <div className="filters">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name"
        />
        <input
          type="text"
          value={userIdFilter}
          onChange={handleUserIdFilter}
          placeholder="Filter by userId"
        />
        <input
          type="text"
          value={dateFilter}
          onChange={handleDateFilter}
          placeholder="Filter by date"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Created At</th>
            <th>Payment Status</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSearchedBills.map((bill) => (
            <tr key={bill.id}>
              <td>{bill.id}</td>
              <td>{bill.user_id}</td>
              <td>{formatDate(bill.created_at)}</td>
              <td>{bill.payment_status}</td>
              <td>{bill.name}</td>
              <td>{bill.email}</td>
              <td>{bill.phone}</td>
              <td>{bill.balance}</td>
              <td>
                <button
                  onClick={() => handleApprove(bill.id)}
                  className="approve-button"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDeny(bill.id)}
                  className="deny-button"
                >
                  Deny
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Enter Amount</h2>
            <form onSubmit={handleModalSubmit}>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
              <div className="modal-buttons">
                <button className="approve-button" type="submit">
                  Approve
                </button>
                <button className="deny-button" onClick={handleModalClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmationModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Confirm Denial</h2>
            <p>Are you sure you want to deny this order?</p>
            <div className="modal-buttons">
              <button
                className="approve-button"
                onClick={handleConfirmationModalConfirm}
              >
                Confirm
              </button>
              <button
                className="deny-button"
                onClick={handleConfirmationModalCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h1>Bill Dashboard</h1>
      <BillTable />
    </div>
  );
};

export default App;
