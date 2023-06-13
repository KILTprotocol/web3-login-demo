import fs from 'fs'

import dotenv from 'dotenv'

// This script is to make the http Ports from the frontend and the backend dynamic.
// This script changes the frontend/package.json file. So, it should be run before starting the frontend.

// Load environment variables from the `.env` file
dotenv.config()
const frontendPort = process.env.FRONTEND_PORT
const backendPort = process.env.BACKEND_PORT
console.log(
  `custom backendPort: ${backendPort}`,
  `custom frontendPort: ${frontendPort}`
)

// Continues only if at least one of the variables was define on the `.env` file
if (frontendPort || backendPort) {
  // Read the package.json file
  const packageJsonPath = './frontend/package.json'
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  if (backendPort) {
    // Update the value for the backend port in the package.json
    packageJson.proxy = `http://localhost:${backendPort}/`
  }
  if (frontendPort) {
    // Update the value for the frontend port in the package.json
    packageJson.scripts.start = `PORT=${frontendPort} react-scripts start`
  }
  // Write the updated package.json back to the file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  console.log('Package.json updated successfully to use custom ports.!')
} else {
  console.log('Using default Ports for server and client-side. ')
}
