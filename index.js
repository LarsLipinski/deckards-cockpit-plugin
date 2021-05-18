export default {
    id: 'cockpit.deckard',
    pluginPoint: 'cockpit.processDefinition.diagram.plugin',
    priority: 2021,
    render: (viewer) => {

        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        window.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
                
        const zoomFactor = 0.1;
        const moveStep = 50;
        const movements = {
            left: {dx: -moveStep, dy: 0}, 
            right: {dx: moveStep, dy: 0}, 
            up: {dx: 0, dy: -moveStep}, 
            down: {dx: 0, dy: moveStep}
        };

        const commandsZoomIn =  ['zoom in', 'magnify', 'larger', 'bigger'];
        const commandsZoomOut =  ['zoom out', 'shrink', 'smaller', 'pull back'];
        const commandsZoomReset =  ['resize', 'reset', 'centre', 'center', 'santa', 'centaur'];
        const commandsMovement = ['left', 'right', 'up', 'down'];
        
        const grammarMovement = '#JSGF V1.0; grammar movement; public <movement> = ' + commandsMovement.join('|');
        const grammarZoom = '#JSGF V1.0; grammar zoom; public <zoom> = ' + commandsZoomIn.join('|') + commandsZoomOut.join('|') + commandsZoomReset.join('|');

        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammarMovement, 1);
        speechRecognitionList.addFromString(grammarZoom, 1);

        const recognition = new SpeechRecognition();
        recognition.grammars = speechRecognitionList;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en';

        recognition.addEventListener('result', event => {
            const item = event.results[0][0];
            const command = item.transcript.toLowerCase();

            console.log('understood: ' + item.transcript);
            console.log('with confidence: ' + item.confidence);
            console.log('command: ' + command);

            if (commandsMovement.includes(command)) {
                viewer.get('canvas').scroll(movements[command]);                    
                console.log('ack: MOVED');

            } else if (commandsZoomIn.includes(command)) {
                const newZoomLevel = viewer.get('canvas').zoom(false) * (1 + zoomFactor);
                viewer.get('canvas').zoom(newZoomLevel);
                console.log('ack: ZOOMED IN');

            } else if (commandsZoomOut.includes(command)) {
                const newZoomLevel = viewer.get('canvas').zoom(false) * (1 - zoomFactor);
                viewer.get('canvas').zoom(newZoomLevel);
                console.log('ack: ZOOMED OUT');

            } else if (commandsZoomReset.includes(command)) {
                viewer.get('canvas').zoom('fit-viewport');
                console.log('ack: ZOOM RESET');
            }
        });

        recognition.addEventListener('end', recognition.start);
        recognition.start();
  },
};
