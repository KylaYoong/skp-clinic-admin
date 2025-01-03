import React from "react";

function Forms() {
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <h1 className="m-0">Forms</h1>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Register Patient */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Register Patient</h3>
                </div>
                <div className="card-body">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="employeeId" className="form-label">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        id="employeeId"
                        className="form-control"
                        placeholder="Enter Employee ID"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Register
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Employee Data Input */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Employee Data Input</h3>
                </div>
                <div className="card-body">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="empId" className="form-label">Employee ID</label>
                      <input type="text" id="empId" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input type="text" id="name" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="gender" className="form-label">Gender</label>
                      <select id="gender" className="form-control">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="dob" className="form-label">Date of Birth</label>
                      <input type="date" id="dob" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="department" className="form-label">Department</label>
                      <input type="text" id="department" className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="mobile" className="form-label">Mobile Number</label>
                      <input type="tel" id="mobile" className="form-control" />
                    </div>
                    <button type="submit" className="btn btn-success">
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Forms;
