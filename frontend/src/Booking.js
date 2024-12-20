import "./Booking.css";
import { useEffect, useState } from "react";
import SlotForm from "./SlotForm";

function Booking() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotType, setSlotType] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [removeModal, setRemoveModal] = useState({
    open: false,
    zoneCode: null,
    slotID: null,
    vehicleRegNo: null,
  });

  const handleOpenModal = (zone, slot, type) => {
    setSelectedZone(zone);
    setSelectedSlot(slot);
    setSlotType(type);
    setShowModal(true);
  };

  const handleRemoveModal = (zoneCode, slotID, vehicleRegNo) => {
    setRemoveModal({ open: true, zoneCode, slotID, vehicleRegNo });
  };

  const handleCloseRemoveModal = () => {
    setRemoveModal({ open: false, zoneCode: null, slotID: null, vehicleRegNo: null });
  };

  const handleVacateSlot = () => {
    const { slotID, vehicleRegNo } = removeModal;
    console.log(`Vacating slot ${slotID} with vehicle registration number ${vehicleRegNo}`);
    
    fetch(`/api/vacate-slot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleRegNo, slotID }),  
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Slot vacated successfully:", data);
        handleCloseRemoveModal();
      })
      .catch((error) => console.error("Error vacating slot:", error));

      window.location.reload();
  };
  

  useEffect(() => {
    fetch("/api/parking-spots")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        alert("Failed to fetch parking spots. Please try again later.");
        setLoading(false);
      });
  }, [setData, setLoading]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const groupedData = data.reduce((acc, slot) => {
    if (!acc.has(slot.ZoneCode)) {
      acc.set(slot.ZoneCode, []);
    }
    acc.get(slot.ZoneCode).push(slot);
    return acc;
  }, new Map());
  console.log("grouped data", groupedData);
  return (
    <div className="App">
      <h1>Parking Management System</h1>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <div>
          <h2>Parking Slots</h2>
          <div style={{ padding: "20px" }}>
            <div className="ParkingZones">
              {[...groupedData.keys()].map((zone) => (
                <div className="zone" key={zone}>
                  <h3 style={{ textAlign: "center" }}>Zone {zone}</h3>
                  <hr className="line" />
                  <div className="parkingSlots">
                    {groupedData.get(zone).map((slot) => (
                      <div
                        key={slot.SlotID}
                        className={
                          slot.VehicleRegNo ? "slot red" : "slot green"
                        }
                        title={
                          slot.VehicleRegNo
                            ? `${slot.SlotID} - Occupied;\nVehicle Reg. No.: ${slot.VehicleRegNo}; \nType: ${slot.Type};`
                            : `${slot.SlotID} - Empty; \nType: ${slot.Type};\nClick to book the slot`
                        }
                        onClick={() =>
                          slot.VehicleRegNo
                            ? handleRemoveModal(slot.ZoneCode, slot.SlotID, slot.VehicleRegNo)
                            : handleOpenModal(slot.ZoneCode, slot.SlotID, slot.Type)
                        }
                      >
                        {slot.SlotID}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {removeModal.open && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Vacate Slot</h2>
                  <p>
                    Are you sure you want to vacate slot{" "}
                    <strong>{removeModal.slotID}</strong> with vehicle registration
                    number <strong>{removeModal.vehicleRegNo}</strong>?
                  </p>
                  <div className="modal-actions">
                    <button onClick={handleCloseRemoveModal}>Close</button>
                    <button onClick={handleVacateSlot}>Vacate</button>
                  </div>
                </div>
              </div>
            )}
            {showModal && (
              <div className="modal">
                <div className="modal-content">
                  <span
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                  >
                    &times;
                  </span>
                  <SlotForm
                    selectedSlot={selectedSlot}
                    selectedZone={selectedZone}
                    slotType={slotType}
                    closeModal={() => setShowModal(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="menu-button"
          >
            Available Slots
          </button>
          {showMenu && (
            <div className="menu">
              <span className="close-btn" onClick={() => setShowMenu(false)}>
                &times;
              </span>
              <div className="menu-section">
                <h3>Cars</h3>
                <ul>
                  {data
                    .filter((slot) => !slot.VehicleRegNo && slot.Type === "Car")
                    .map((slot) => (
                      <li key={slot.SlotID}>
                        Zone {slot.ZoneCode} - Slot {slot.SlotID}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="menu-section">
                <h3>Bikes</h3>
                <ul>
                  {data
                    .filter(
                      (slot) => !slot.VehicleRegNo && slot.Type === "Bike"
                    )
                    .map((slot) => (
                      <li key={slot.SlotID}>
                        Zone {slot.ZoneCode} - Slot {slot.SlotID}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="menu-section">
                <h3>Trucks</h3>
                <ul>
                  {data
                    .filter(
                      (slot) => !slot.VehicleRegNo && slot.Type === "Truck"
                    )
                    .map((slot) => (
                      <li key={slot.SlotID}>
                        Zone {slot.ZoneCode} - Slot {slot.SlotID}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Booking;
