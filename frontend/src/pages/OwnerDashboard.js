import { useEffect, useState } from "react";
import {
  addParking,
  getMyParking,
  deleteParking,
} from "../services/parkingService";

function OwnerDashboard() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    pricePerHour: "",
    totalSlots: "",
  });

  const [myParking, setMyParking] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyParking();
  }, []);

  // Load Owner Parking
  const loadMyParking = async () => {
    try {
      const data = await getMyParking();
      setMyParking(data.parking);
    } catch (error) {
      console.log(error);
    }
  };

  // Form Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add Parking
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await addParking(formData);

      alert(data.message);

      setFormData({
        name: "",
        address: "",
        city: "",
        pricePerHour: "",
        totalSlots: "",
      });

      loadMyParking();
    } catch (err) {
      alert(err.response?.data?.message || "Unable to Add Parking");
    }

    setLoading(false);
  };

  // Delete Parking
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this parking?")) return;

    try {
      const data = await deleteParking(id);

      alert(data.message);

      loadMyParking();
    } catch (err) {
      alert(err.response?.data?.message || "Delete Failed");
    }
  };

  return (
    <div className="container py-5">

      <h2 className="text-center mb-4">
        🅿 Owner Dashboard
      </h2>

      {/* Add Parking */}

      <div className="card shadow-lg p-4 mb-5">

        <h4 className="mb-4">
          Add New Parking
        </h4>

        <form onSubmit={handleSubmit}>

          <div className="row">

            <div className="col-md-6 mb-3">
              <input
                className="form-control"
                placeholder="Parking Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <input
                className="form-control"
                placeholder="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <input
                className="form-control"
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3 mb-3">
              <input
                type="number"
                className="form-control"
                placeholder="Price Per Hour"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3 mb-3">
              <input
                type="number"
                className="form-control"
                placeholder="Total Slots"
                name="totalSlots"
                value={formData.totalSlots}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <button
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Parking"}
          </button>

        </form>

      </div>

      {/* Parking List */}

      <h3 className="mb-4">
        My Parking
      </h3>

      <div className="row">

        {myParking.length === 0 ? (

          <div className="col-12">
            <div className="alert alert-warning">
              No Parking Added Yet
            </div>
          </div>

        ) : (

          myParking.map((item) => (

            <div className="col-md-4 mb-4" key={item._id}>

              <div className="card shadow h-100">

                <div className="card-body">

                  <h5>{item.name}</h5>

                  <p>📍 {item.city}</p>

                  <p>🏠 {item.address}</p>

                  <p>💰 ₹{item.pricePerHour}/Hour</p>

                  <p>🅿 {item.totalSlots} Slots</p>

                  <div className="d-flex gap-2">

                    <button className="btn btn-warning btn-sm">
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}

export default OwnerDashboard;