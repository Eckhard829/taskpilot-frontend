#!/bin/bash
npm install
chmod +x node_modules/.bin/react-scripts
CI=false npx react-scripts build