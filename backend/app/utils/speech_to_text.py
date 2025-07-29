from google.cloud import speech

def transcribe_audio(audio_path: str, silence_gap: float = 1.0):
    """
    Transcribe `audio_path` and detect silences ≥ silence_gap seconds.
    Returns (transcript: str, pauses: List[dict]).
    """
    client = speech.SpeechClient()
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    audio  = speech.RecognitionAudio(content=audio_bytes)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48_000,
        language_code="en-US",
        enable_word_time_offsets=True,     
        enable_automatic_punctuation=True 
    )

    response = client.recognize(config=config, audio=audio)

    words = [
        w for res in response.results
        for w in res.alternatives[0].words
    ]
    transcript = " ".join(w.word for w in words)

    pauses = []
    for i in range(1, len(words)):
        gap = (
            words[i].start_time.total_seconds()
            - words[i - 1].end_time.total_seconds()
        )
        if gap >= silence_gap:
            pauses.append({
                "after_word": words[i - 1].word,
                "duration": round(gap, 2),
                "starts_at": round(words[i - 1].end_time.total_seconds(), 2)
            })

    return transcript, pauses