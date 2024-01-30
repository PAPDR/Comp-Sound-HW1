
//Key Bindings
const keyboardFrequencyMap = {
    '90': 261.625565300598634,  //Z - C
    '83': 277.182630976872096, //S - C#
    '88': 293.664767917407560,  //X - D
    '68': 311.126983722080910, //D - D#
    '67': 329.627556912869929,  //C - E
    '86': 349.228231433003884,  //V - F
    '71': 369.994422711634398, //G - F#
    '66': 391.995435981749294,  //B - G
    '72': 415.304697579945138, //H - G#
    '78': 440.000000000000000,  //N - A
    '74': 466.163761518089916, //J - A#
    '77': 493.883301256124111,  //M - B
    '81': 523.251130601197269,  //Q - C
    '50': 554.365261953744192, //2 - C#
    '87': 587.329535834815120,  //W - D
    '51': 622.253967444161821, //3 - D#
    '69': 659.255113825739859,  //E - E
    '82': 698.456462866007768,  //R - F
    '53': 739.988845423268797, //5 - F#
    '84': 783.990871963498588,  //T - G
    '54': 830.609395159890277, //6 - G#
    '89': 880.000000000000000,  //Y - A
    '55': 932.327523036179832, //7 - A#
    '85': 987.766602512248223,  //U - B
    '73': 1174.659,             //I - D
}

song1 = ['73', '82', '87', '73', '82', '87'].toString(); //Song of Storms
song2 =  ['89', '85', '73', '89', '85', '73'].toString(); //Eponas Song ;
var songList = [song1, song2];
var songNameList = ["StormSong.mp3", "EponaSong.mp3"];



//Max Time
var maxAlltime = 0;
var globalAnalyser;

//Audio for music
var songPlaying = new Audio('StormSong.mp3');




document.addEventListener("DOMContentLoaded", function(event) {
    //Variables
    sawtoothMode = false; //determines whether using saw or sin mode
    playingMusic = false;

    //Create audioCTX
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    //Create global gain
    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime)
    globalGain.connect(audioCtx.destination);
    
    
    //Oscillators
    activeOscillators = {}
    let activeGainNodes = {};

    //Key Click Functions
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    //Last 6 notes. Keeps track of the Last 6 notes played to activate sound effects
    var lastSixNotes = ['0', '0', '0', '0', '0', '0'];
    
    


    function addToBuffer(value) {
        lastSixNotes.unshift(value);  //Add the new value to the front
      
        if (lastSixNotes.length > 6) {
          lastSixNotes.pop();  //Remove the last value if the buffer is full
        }

    }

    function clearBuffer(value){
        lastSixNotes = ['0', '0', '0', '0', '0', '0'];
    }

    function checkBufferContent(currentInput){

        currentBuffer = currentInput.toString();
        console.log(currentBuffer);
        //Check to see if the current input is in the buffer
        for (let i = 0; i < songList.length; i++) {
            if(songList[i] === currentBuffer){
                console.log("Song Match!");
                clearBuffer();
                playMusic(i); //Pass in the id of songlist to get correct name
            }
        }


    }

    function keyDown(event) {
        const key = (event.detail || event.which).toString();

        //Switch to sawtooth
        // spacebar toggles between sine and sawtooth
        if (key === "32") {
            sawtoothMode = !sawtoothMode;
        }

        if ( key === '80'){
            playMusic();
        }

        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
            addToBuffer(key);
            checkBufferContent(lastSixNotes);
        }
    }
    
    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            
            activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime);
            activeGainNodes[key].gain.setTargetAtTime(0, audioCtx.currentTime, 0.01 );
            activeOscillators[key].stop(audioCtx.currentTime + 0.05);
            delete activeOscillators[key];
            delete activeGainNodes[key];
        }
    }
    
    function playNote(key) {
        //Create Oscillator
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)

        //Controls whether on sawtooth or sine
        if (sawtoothMode) {
            osc.type = "sawtooth";
        } else {
            osc.type = "sine"; //choose your favorite waveform
        }

        //Create the Gain and connect
        var myGain = audioCtx.createGain();
        myGain.gain.setValueAtTime(0, audioCtx.currentTime);
        osc.connect(myGain).connect(audioCtx.destination);

        //START ---------------------------------------------
        osc.start();
        activeOscillators[key] = osc
        activeGainNodes[key] = myGain;


        let gainFactor = Object.keys(activeGainNodes).length;

        //Attack
        //Reduce gain on all nodes for polyphony
        Object.keys(activeGainNodes).forEach(function(key) {
            activeGainNodes[key].gain.setTargetAtTime(
            0.7 / gainFactor,
            audioCtx.currentTime,
            0.15
            );
        });

        //Decay after release
        myGain.gain.setTargetAtTime(
            0.425 / gainFactor,
            audioCtx.currentTime + 0.15,
            0.15
        );
        




    }


    function playMusic(songID){
        
        //Stop function if the song doesn't exist

        //Assign audio and play it
        if(songPlaying.duration > 0 && songPlaying.paused){
            console.log(songID);
            console.log(songNameList[songID]);
            songPlaying = new Audio(songNameList[songID]);
            songPlaying.play();
        }
        
    }

   


})



