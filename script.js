let mediaRecorder;
let chunks = [];
let transcriptionDiv = document.getElementById('transcription');
let speakersDiv = document.getElementById('speakers');
let speakers = {};
let speakerCount = 1;
let recordingData = null;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const saveButton = document.getElementById('save');
const deleteButton = document.getElementById('delete');
const resumeButton = document.getElementById('resume');
const uploadInput = document.getElementById('upload');

startButton.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Placeholder for transcription (replace with actual AI transcription if possible)
        const transcription = "Transcription: (Placeholder) Speaker " + speakerCount + ": Test sentence. ";
        speakerCount++;
        
        let speakerName = `Speaker ${speakerCount-1}`;
        speakers[speakerName] = speakerName;

        transcriptionDiv.innerHTML += `<p>${speakerName}: ${transcription.split(": ")[1]}</p>`;
        updateSpeakers();

        recordingData = {
            date: new Date().toISOString(),
            speakers: speakers,
            transcription: transcriptionDiv.innerHTML,
            audioUrl: audioUrl
        };

        stopButton.disabled = true;
        saveButton.disabled = false;
        deleteButton.disabled = false;
        resumeButton.disabled = false;
        chunks = [];
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
    resumeButton.disabled = true;
};

stopButton.onclick = () => {
    mediaRecorder.stop();
};

saveButton.onclick = () => {
    const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    meetings.push(recordingData);
    localStorage.setItem('meetings', JSON.stringify(meetings));
    alert('Meeting saved!');
};

deleteButton.onclick = () => {
    transcriptionDiv.innerHTML = '';
    speakers = {};
    speakerCount = 1;
    recordingData = null;
    saveButton.disabled = true;
    deleteButton.disabled = true;
    resumeButton.disabled = true;
    startButton.disabled = false;
};

resumeButton.onclick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Placeholder for transcription (replace with actual AI transcription if possible)
        const transcription = "Transcription: (Placeholder) Speaker " + speakerCount + ": Resumed sentence. ";
        speakerCount++;

        let speakerName = `Speaker ${speakerCount-1}`;
        speakers[speakerName] = speakerName;

        transcriptionDiv.innerHTML += `<p>${speakerName}: ${transcription.split(": ")[1]}</p>`;
        updateSpeakers();

        recordingData = {
            date: new Date().toISOString(),
            speakers: speakers,
            transcription: transcriptionDiv.innerHTML,
            audioUrl: audioUrl
        };

        stopButton.disabled = true;
        saveButton.disabled = false;
        deleteButton.disabled = false;
        resumeButton.disabled = false;
        chunks = [];
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
    resumeButton.disabled = true;
};

function updateSpeakers() {
    speakersDiv.innerHTML = '';
    Object.keys(speakers).forEach(speaker => {
        speakersDiv.innerHTML += `<input type="text" value="${speakers[speaker]}" data-speaker="${speaker}">`;
    });

    speakersDiv.querySelectorAll('input').forEach(input => {
        input.onchange = () => {
            const oldSpeakerName = input.dataset.speaker;
            const newSpeakerName = input.value;
            speakers[newSpeakerName] = newSpeakerName;
            delete speakers[oldSpeakerName];
            
            // Update transcription with new speaker names
            let transcriptionHtml = transcriptionDiv.innerHTML;
            transcriptionHtml = transcriptionHtml.replace(new RegExp(`${oldSpeakerName}:`, 'g'), `${newSpeakerName}:`);
            transcriptionDiv.innerHTML = transcriptionHtml;
            updateSpeakers();
        };
    });
}

uploadInput.onchange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const meeting = JSON.parse(e.target.result);
            transcriptionDiv.innerHTML = meeting.transcription;
            speakers = meeting.speakers;
            updateSpeakers();
        };
        reader.readAsText(file);
    }
};
