# 🌐 AI Virtual World

**An immersive virtual environment powered by AI and JavaScript**

Welcome to **AI Virtual World**, where creativity meets technology. This project demonstrates the fusion of AI-driven interactions with a beautifully designed virtual environment. Step in and experience the future of interactive digital spaces!

---

## 🚀 Features

- **Dynamic AI Characters**: Intelligent entities that interact in real-time.
- **Rich Graphics**: Stunning visuals created with WebGL and Three.js.
- **Real-time Interaction**: Engage with the virtual world through smart prompts and actions.
- **Customizable Worlds**: Build and modify your virtual spaces with ease.

---

## 🛠️ Technologies Used

- **JavaScript**: The backbone of the project.
- **AI Frameworks**: Powered by advanced AI models (e.g., TensorFlow.js or OpenAI).
- **WebGL/Three.js**: For 3D rendering and immersive visuals.
- **Node.js**: Backend for real-time data handling.

---

## 📖 Getting Started

### Prerequisites

- **Node.js**: Install the latest version [here](https://nodejs.org/).
- **Browser**: A modern browser supporting WebGL.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-virtual-world.git
   ```

---

## 🗺️ Using Open Street Map (OSM)

This application supports loading the world using OSM data.

### Steps to fetch OSM data.

1. Go to www.overpass-turb.eu
2. Select the region from the world map that you want to load onto the app.
3. Paste the following in the left side of the map area to perform some initial data filtering and remove any irrelevant data.

```
[out:json];
(
way['highway']
['highway' !~'pedestrian']
['highway' !~'footway']
['highway' !~'cycleway']
['highway' !~'path']
['highway' !~'service']
['highway' !~'corridor']
['highway' !~'track']
['highway' !~'steps']
['highway' !~'raceway']
['highway' !~'bridleway']
['highway' !~'proposed']
['highway' !~'construction']
['highway' !~'elevator']
['highway' !~'bus_guideway']
['access' !~'private']
['access' !~'no']
({{bbox}});
);
out body;

> ;
out skel;
```
