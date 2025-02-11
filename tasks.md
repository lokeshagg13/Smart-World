# P3

1. Confirmation for reset simulation, exit simulation buttons (with do not show again if possible).
2. Way to avoid saving the same world multiple times.
3. Check and compare where the loading progress bar reaches end and where not and find any differences.


# P2

1. Handle mobile tablet mode and laptop mode
2. Only allow placements of traffic lights near the road intersections with degree > 2 (max distance of say 100).

# P1 - Immediate


# Done

29 Jan

1. Traffic light must be above all markings including cars.
2. Targets are added and updated only for car which is being followed.
3. Only target for followed car are shown.
4. Unused targets are removed from the world.

30 Jan

5. Car selection mode to select the car to follow.
6. Add markings only when no marking exist at a point.
7. Simulation mode fixed and followed car for simulation mode is distinguished from selected car for non-simulation modes.
8. Fixed collisions for sharp turns.

31 Jan

9. More info in settings form and variablizing the min and max values in HTML using JS functions.
10. Refactored main.js into regions for easy readability.
11. Show manual override warning in world mode
12. Alert to add password for admin access.
13. Allow different car styles to be shown on the map using car style selection dropdown.

03 Feb

14. Enhancing car select button styling.
15. Adding pedcount of crossings and also maintain an array of pedestrian objects that are visible on the map.
16. Synchronize pedestrian movements with traffic lights.

05 Feb

17. Fill world with N random cars.

06 Feb

18. Checked for collisions with other cars.

08 Feb

19. Distance to target and ETA shown for selected cars.

10 Feb

20. Fix simulation to avoid check for car collisions.
21. Transparency for simulating cars.
22. Slower zooming of minimap with shift key.
23. Handling roundabouts in world.
24. Marking Editors to include type (ROADSPREAD/LANESPREAD) instead of target segments.
25. Handling case where no path exist between src and dest.
26. Addings car engine sound and success sound in world.

11 Feb

27. Deploying the app.
28. Download world json as well as load world using JSON file or JSON data.
29. Loaders to show while delay in saving or loading bigger worlds.


