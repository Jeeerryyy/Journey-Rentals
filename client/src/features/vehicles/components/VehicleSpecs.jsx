import { UsersIcon, FuelIcon, GearIcon, ClockIcon, CheckIcon } from '../../../components/Icons'

const VehicleSpecs = ({ vehicle }) => {
  return (
    <>
      <div className="cardetails-specs-bar">
        {[
          { icon: <UsersIcon />, label: 'Capacity',     val: `${vehicle.sittingCapacity} Seats` },
          { icon: <FuelIcon />,  label: 'Fuel Type',    val: vehicle.fuelType },
          { icon: <GearIcon />,  label: 'Transmission', val: vehicle.transmission },
          { icon: <ClockIcon />, label: vehicle.type === 'bike' ? 'Min Rental' : 'Min Days', val: vehicle.type === 'bike' ? '3 Hours' : '1 Day' },
        ].map(({ icon, label, val }) => (
          <div className="cardetails-spec" key={label}>
            {icon}
            <div>
              <div className="cardetails-spec-label">{label}</div>
              <div className="cardetails-spec-value">{val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cardetails-section-title">
        About this {vehicle.type === 'bike' ? 'bike' : 'car'}
      </div>
      <p className="cardetails-desc">{vehicle.description}</p>

      {vehicle.features?.length > 0 && (
        <>
          <div className="cardetails-section-title">Features & Amenities</div>
          <div className="cardetails-features">
            {vehicle.features.map(f => (
              <div key={f} className="cardetails-feature">
                <div className="cardetails-feature-check"><CheckIcon /></div>{f}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default VehicleSpecs
