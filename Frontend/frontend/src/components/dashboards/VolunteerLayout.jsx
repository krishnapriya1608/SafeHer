export default function VolunteerLayout() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-3xl bg-blue-900 p-8 text-white">
        <h1 className="text-4xl font-bold">
          Volunteer Dashboard
        </h1>

        <p className="mt-2">
          Respond to nearby SOS alerts and assist users.
        </p>
      </section>

      {/* Stats */}
      <section className="grid md:grid-cols-3 gap-5">

        <div className="rounded-xl bg-white p-6 shadow">
          <h2>New Alerts</h2>
          <p className="text-3xl font-bold">3</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2>Accepted Cases</h2>
          <p className="text-3xl font-bold">2</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2>Completed</h2>
          <p className="text-3xl font-bold">18</p>
        </div>

      </section>

      {/* SOS Cards */}

      <section className="space-y-4">

        <div className="rounded-xl bg-white p-5 shadow">

          <h2 className="font-bold">
            🚨 SOS Alert
          </h2>

          <p>User : Anjali</p>

          <p>Distance : 1.2 km</p>

          <button className="mt-3 rounded bg-blue-600 px-4 py-2 text-white">
            Accept
          </button>

        </div>

      </section>

      {/* Map */}

      <section className="rounded-xl bg-white p-5 shadow h-96">

        Google Map Here

      </section>

    </div>
  );
}