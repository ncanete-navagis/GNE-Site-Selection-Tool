import React from 'react'
import { Form, InputGroup } from 'react-bootstrap'

const HeaderControlBar = () => {
  return (
    <div className="d-flex align-items-center justify-content-between w-100 px-2 pt-1">
      {/* Brand Logo */}
      <div className="d-flex align-items-center gap-2">
        <div className="bg-primary rounded p-1" style={{ width: '32px', height: '32px' }}>
          <img src="/vite.svg" alt="NAVAGIS" className="img-fluid" />
        </div>
        <span className="fw-bold tracking-wider fs-5">NAVAGIS</span>
      </div>

      {/* Search Input */}
      <div className="flex-grow-1 mx-4">
        <InputGroup className="bg-transparent border-0">
          <Form.Control
            placeholder="Search..."
            aria-label="Search"
            className="rounded-pill px-4"
          />
          <InputGroup.Text className="bg-transparent border-0 position-absolute end-0 top-50 translate-middle-y z-3 me-2">
             🔍
          </InputGroup.Text>
        </InputGroup>
      </div>

      {/* User Profile */}
      <div 
        className="rounded-circle bg-secondary overflow-hidden" 
        style={{ width: '40px', height: '40px' }}
      >
        <img src="https://via.placeholder.com/40" alt="Profile" />
      </div>
    </div>
  )
}

export default HeaderControlBar
