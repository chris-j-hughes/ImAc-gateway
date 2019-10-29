# ImAc-gateway
A node.js based gateway for remote control of the ImAc project (https://www.imac-project.eu/)
The gateway is a node.hs server which manages all of the communication between voice control devices and the player. During tests it is helpful to understand how the gateway works in order to understand if the communication is working correctly. 

There are three types of ‘device’, which can connect to the gateway:
1.	Controllers – Any device which issues commands
2.	Players – Any device which consumes commands
3.	Monitors – Any device which consumes all communications for testing and monitoring

All devices are given a Device_ID. This is important as is dictates which player is listening to which controller. For example there could be multiple players and controllers using the gateway, but only those with the same Device_ID will talk to each other.

For example: If you have a player with the ID ‘USAL’ it will receive commands from a controller with the ID ‘USAL’ but not from a controller with the ID ‘RNIB’.

The gateway-gateway-monitor page contains three sections as below:

‘Currently connected devices’, shows all of the connections to the gateway. The gateway-gateway-monitor page will appear in the list of devices as a monitor, and you can then see each of the connected players, controllers and other monitor pages that are currently open. 

‘Latest Activity’ shows the every activity that the server has performed since you opened the page. This includes devices connecting and disconnecting as well as commands being sent.

‘Links’ gives two html links to other pages on the server, which replicates a controller and a player. Opening either of these will ask for the user to type in a device_ID, and then replicate either a controller or a player. These are really useful for testing, as the controller link allows you to create a remote control and if you give it the same device_ID as the Amazon echo it can be used to remotely start of stop the video or open the menu etc if you need to help the participant. Opening a player page is also useful as if you give it the same device_ID as the your echo each time a command is send it will be displayed on the page.

A useful test for experimentation is to open three pages: A monitor,  a layer and a controller. Provided you give the player and the controller the same device_ID (which can be any name you make up, such as ‘USAL_TEST’ or ‘RNIB_DEMO’ etc), pressing the buttons on the controller will cause the player page to display the command. You can then also all of the devices connected in the monitor as see the activity as commands are sent.
