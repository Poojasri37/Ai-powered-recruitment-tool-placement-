# 🎤 Voice Interview - Quick Test Guide

## ✅ What's Fixed

1. **Voice transcription now captures your speech** ✅
2. **Automatically moves to next question after 2 seconds of silence** ✅
3. **Stays on current question if no answer provided** ✅
4. **Shows "Transcribing..." indicator when listening** ✅

---

## 🚀 Quick Start

### Access the Interview
```
Frontend: http://localhost:3003
Backend: http://localhost:5000
```

### Test Flow
```
1. Login as CANDIDATE
2. Go to: My Applications
3. Find: Interview Scheduled
4. Click: "Start Interview" (green button with Play icon)
5. Grant: Camera & Microphone permissions
6. Experience: 10-question AI voice interview
```

---

## 🎙️ During Interview

### You'll See:
- ✅ AI Robot avatar speaking (animated mouth)
- ✅ Question displayed in text + heard out loud
- ✅ "Transcribing..." indicator when listening
- ✅ Your words appearing real-time in textarea

### How to Answer:
**Option A - Voice:**
1. Click "🎤 Start Speaking"
2. Speak your answer clearly
3. Wait 2 seconds after finishing
4. Page auto-advances to next question

**Option B - Type:**
1. Type your answer directly in textarea
2. Click "Next Question"
3. Proceeds to next question

**Option C - Mix Both:**
1. Speak some words
2. Edit the transcription
3. Add more text by typing
4. Click "Next Question"

---

## 🔍 Verify It's Working

### Check 1: Voice Capture
```
✓ Speak a sentence
✓ Wait 1-2 seconds
✓ You should see text in textarea
✓ Should match what you said
```

### Check 2: Auto-Advance
```
✓ Finish speaking
✓ Stop talking for 2 seconds
✓ Page automatically goes to next question
✓ AI speaks new question
```

### Check 3: Error Handling
```
✓ Try clicking "Next" with no answer
✓ Should show error message
✓ Should STAY on same question (not exit)
✓ Can speak or type to fix
```

---

## 🎯 Full Interview Test

| Question | Type | Duration |
|----------|------|----------|
| Q1 | Behavioral | Speak ~30 sec |
| Q2 | Behavioral | Speak ~30 sec |
| Q3 | Technical | Speak ~30 sec |
| Q4 | Technical | Speak ~30 sec |
| Q5 | Technical | Speak ~30 sec |
| Q6 | Coding | Type code |
| Q7 | Coding | Type code |
| Q8 | Situational | Speak ~30 sec |
| Q9 | Situational | Speak ~30 sec |
| Q10 | Situational | Speak ~30 sec |

**Total Interview Time:** ~5 minutes

---

## ⚠️ Troubleshooting

### "Not Transcribing"
- Check microphone is allowed in browser
- Check microphone permissions (look at address bar)
- Try using Chrome (best support)
- Make sure you click "Start Speaking" first

### "Not Auto-Advancing"
- Make sure you have final transcription (words in textarea)
- Wait at least 2 seconds after speaking
- Silence needs to be detected
- Try clicking "Next Question" manually

### "Exiting Interview"
- ✅ FIXED - Should now stay on page
- If still exits, clear browser cache and reload

---

## 📊 Expected Results After Interview

1. **Interview Complete Page**
   - Shows your overall score (0-100%)
   - Message: "Your responses are being analyzed by AI"
   - Button: "Go to Dashboard"

2. **Recruiter Can See**
   - All 10 Q&A transcripts
   - Your spoken answers (text)
   - Code submissions (for Q6, Q7)
   - AI evaluation for each response
   - Overall score and summary

3. **Candidate Can See**
   - Final score
   - Email with results (within 24 hours)
   - Application status updated

---

## 🎉 Success Indicators

✅ AI speaks questions clearly
✅ Your voice is captured and transcribed
✅ Text appears in real-time as you speak
✅ Page auto-advances after silence
✅ All 10 questions completed
✅ Score calculated and displayed
✅ Results visible to recruiter

---

## 💡 Pro Tips

1. **Speak Clearly** - Better transcription
2. **Take Your Time** - No time limits between questions
3. **Use Pauses** - Don't rush, let system detect silence
4. **Edit if Needed** - Can always correct transcription
5. **Test Mic First** - Ensure microphone works before interview

---

**Ready to test? Start the interview and experience the AI voice interaction!** 🚀

