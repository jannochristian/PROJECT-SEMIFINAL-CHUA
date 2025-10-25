import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function studentsAnalyzer(subjectName, studentsData) {
  try {
    const prompt = `
      Analyze these student grades for ${subjectName}:
      ${JSON.stringify(studentsData, null, 2)}

      Please provide:
      1. A detailed analysis of student performance
      2. List of students who passed (grade <= 3.0)
      3. List of students who failed (grade > 3.0)
      
      Return the analysis in JSON format.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      analysis: "Error generating analysis",
      passedStudents: [],
      failedStudents: []
    };
  }
}

export async function analyzeStudentData(students) {
  try {
    const prompt = `
      Analyze this student data:
      ${JSON.stringify(students, null, 2)}

      Please provide:
      1. A summary of the student population
      2. Distribution by year level
      3. Course enrollment patterns
      
      Return the analysis in this JSON format:
      {
        "summary": "Overall analysis...",
        "yearLevelDistribution": "Analysis of year levels...",
        "coursePatterns": "Analysis of course patterns..."
      }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      summary: "Error generating analysis",
      yearLevelDistribution: "",
      coursePatterns: ""
    };
  }
}

export async function analyzeSubjectData(subjects) {
  try {
    const prompt = `
      Analyze this subject data:
      ${JSON.stringify(subjects, null, 2)}

      Please provide:
      1. An overview of the subjects offered
      2. Subject distribution analysis
      3. Recommendations for curriculum balance
      
      Return the analysis in this JSON format:
      {
        "overview": "General analysis...",
        "distribution": "Subject distribution analysis...",
        "recommendations": "Curriculum recommendations..."
      }
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      overview: "Error generating analysis",
      distribution: "",
      recommendations: ""
    };
  }
}
