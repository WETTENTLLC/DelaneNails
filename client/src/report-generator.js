/**
 * DelaneNails AI Test Report Generator
 * Updated to save results to Supabase
 */

const fs = require('fs');
const path = require('path');
const { getSupabaseManager } = require('./supabase-integration');

class ReportGenerator {
  constructor(resultsData) {
    this.results = resultsData;
    this.timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    this.supabaseManager = getSupabaseManager();
  }
  
  async generateConsoleReport() {
    console.log("\n\n📊 AI AGENT TEST RESULTS SUMMARY 📊");
    console.log("=====================================");
    
    let totalQuestions = 0;
    let totalNonEmpty = 0;
    let totalRelevant = 0;
    let totalAccurate = 0;
    let totalHelpful = 0;
    
    for (const [category, results] of Object.entries(this.results)) {
      const relevancePercentage = (results.relevantResponses / results.questions) * 100;
      const accuracyPercentage = (results.accurateResponses / results.questions) * 100;
      const helpfulnessPercentage = (results.helpfulResponses / results.questions) * 100;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`Questions asked: ${results.questions}`);
      console.log(`Non-empty responses: ${results.nonEmptyResponses}`);
      console.log(`Relevant responses: ${results.relevantResponses} (${relevancePercentage.toFixed(1)}%)`);
      console.log(`Accurate responses: ${results.accurateResponses} (${accuracyPercentage.toFixed(1)}%)`);
      console.log(`Helpful responses: ${results.helpfulResponses} (${helpfulnessPercentage.toFixed(1)}%)`);
      
      totalQuestions += results.questions;
      totalNonEmpty += results.nonEmptyResponses;
      totalRelevant += results.relevantResponses;
      totalAccurate += results.accurateResponses;
      totalHelpful += results.helpfulResponses;
    }
    
    const overallRelevancePercentage = (totalRelevant / totalQuestions) * 100;
    const overallAccuracyPercentage = (totalAccurate / totalQuestions) * 100;
    const overallHelpfulnessPercentage = (totalHelpful / totalQuestions) * 100;
    const overallScore = (overallRelevancePercentage + overallAccuracyPercentage + overallHelpfulnessPercentage) / 3;
    
    console.log("\n📈 OVERALL RESULTS:");
    console.log(`Total questions: ${totalQuestions}`);
    console.log(`Total non-empty responses: ${totalNonEmpty}`);
    console.log(`Total relevant responses: ${totalRelevant} (${overallRelevancePercentage.toFixed(1)}%)`);
    console.log(`Total accurate responses: ${totalAccurate} (${overallAccuracyPercentage.toFixed(1)}%)`);
    console.log(`Total helpful responses: ${totalHelpful} (${overallHelpfulnessPercentage.toFixed(1)}%)`);
    console.log(`Overall AI score: ${overallScore.toFixed(1)}%`);
    
    this.logPerformanceAssessment(overallScore);
    
    const summary = {
      totalQuestions,
      totalNonEmpty,
      totalRelevant,
      totalAccurate,
      totalHelpful,
      overallRelevancePercentage,
      overallAccuracyPercentage,
      overallHelpfulnessPercentage,
      overallScore,
      timestamp: new Date().toISOString()
    };
    
    // Save results to Supabase if available
    if (this.supabaseManager) {
      await this.supabaseManager.saveTestResults({
        ...summary,
        categoryResults: this.results
      });
    }
    
    return summary;
  }
  
  logPerformanceAssessment(overallScore) {
    if (overallScore >= 90) {
      console.log("\n✅ TEST PASSED: AI Agent demonstrates excellent knowledge of website content");
      console.log("The AI is ready for deployment and should handle customer inquiries effectively.");
    } else if (overallScore >= 75) {
      console.log("\n⚠️ TEST PARTIALLY PASSED: AI Agent has good knowledge but improvements needed");
      console.log("The AI is functional but would benefit from additional training in specific areas.");
    } else if (overallScore >= 60) {
      console.log("\n⚠️ TEST BARELY PASSED: AI Agent needs significant improvements");
      console.log("The AI has basic functionality but requires substantial enhancements before deployment.");
    } else {
      console.log("\n❌ TEST FAILED: AI Agent does not meet minimum requirements");
      console.log("The AI needs to be retrained or reconfigured before it can effectively assist customers.");
    }
  }
  
  generateHTMLReport() {
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `ai-test-report-${this.timestamp}.html`);
    
    // Get summary data
    let totalQuestions = 0;
    let totalRelevant = 0;
    let totalAccurate = 0;
    let totalHelpful = 0;
    
    for (const results of Object.values(this.results)) {
      totalQuestions += results.questions;
      totalRelevant += results.relevantResponses;
      totalAccurate += results.accurateResponses;
      totalHelpful += results.helpfulResponses;
    }
    
    const overallRelevancePercentage = (totalRelevant / totalQuestions) * 100;
    const overallAccuracyPercentage = (totalAccurate / totalQuestions) * 100;
    const overallHelpfulnessPercentage = (totalHelpful / totalQuestions) * 100;
    const overallScore = (overallRelevancePercentage + overallAccuracyPercentage + overallHelpfulnessPercentage) / 3;
    
    // Create category data for chart
    const categories = Object.keys(this.results);
    const relevanceData = categories.map(cat => 
      (this.results[cat].relevantResponses / this.results[cat].questions) * 100
    );
    const accuracyData = categories.map(cat => 
      (this.results[cat].accurateResponses / this.results[cat].questions) * 100
    );
    const helpfulnessData = categories.map(cat => 
      (this.results[cat].helpfulResponses / this.results[cat].questions) * 100
    );
    
    // Determine performance level
    let performanceLevel, performanceColor;
    if (overallScore >= 90) {
      performanceLevel = "Excellent";
      performanceColor = "#4CAF50";
    } else if (overallScore >= 75) {
      performanceLevel = "Good";
      performanceColor = "#2196F3";
    } else if (overallScore >= 60) {
      performanceLevel = "Needs Improvement";
      performanceColor = "#FF9800";
    } else {
      performanceLevel = "Insufficient";
      performanceColor = "#F44336";
    }
    
    // Generate HTML content
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DelaneNails AI Agent Test Report</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f7f7f7;
        }
        .header {
          background-color: #8A2BE2;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 20px;
          border-radius: 0 0 10px 10px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .summary-box {
          background-color: ${performanceColor};
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: center;
        }
        .chart-container {
          position: relative;
          height: 400px;
          margin: 20px 0;
        }
        .metric {
          display: inline-block;
          width: 30%;
          text-align: center;
          margin: 10px;
          padding: 15px;
          border-radius: 8px;
          background-color: #f5f5f5;
        }
        .metric h3 {
          margin-top: 0;
        }
        .metric .value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .recommendations {
          background-color: #e1f5fe;
          padding: 15px;
          border-left: 5px solid #03a9f4;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DelaneNails AI Agent Test Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="content">
        <div class="summary-box">
          <h2>Overall Performance: ${performanceLevel}</h2>
          <h1>${overallScore.toFixed(1)}%</h1>
          <p>Based on ${totalQuestions} test questions across ${categories.length} categories</p>
        </div>
        
        <div class="metrics">
          <div class="metric">
            <h3>Relevance</h3>
            <div class="value">${overallRelevancePercentage.toFixed(1)}%</div>
            <p>Responses address the queries</p>
          </div>
          <div class="metric">
            <h3>Accuracy</h3>
            <div class="value">${overallAccuracyPercentage.toFixed(1)}%</div>
            <p>Correct information provided</p>
          </div>
          <div class="metric">
            <h3>Helpfulness</h3>
            <div class="value">${overallHelpfulnessPercentage.toFixed(1)}%</div>
            <p>Useful for customer needs</p>
          </div>
        </div>
        
        <h2>Performance by Category</h2>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
        </div>
        
        <h2>Detailed Results</h2>
        <table>
          <tr>
            <th>Category</th>
            <th>Questions</th>
            <th>Relevance</th>
            <th>Accuracy</th>
            <th>Helpfulness</th>
          </tr>
          ${categories.map(cat => {
            const results = this.results[cat];
            const relevancePercentage = (results.relevantResponses / results.questions) * 100;
            const accuracyPercentage = (results.accurateResponses / results.questions) * 100;
            const helpfulnessPercentage = (results.helpfulResponses / results.questions) * 100;
            
            return `
            <tr>
              <td>${cat.charAt(0).toUpperCase() + cat.slice(1)}</td>
              <td>${results.questions}</td>
              <td>${relevancePercentage.toFixed(1)}%</td>
              <td>${accuracyPercentage.toFixed(1)}%</td>
              <td>${helpfulnessPercentage.toFixed(1)}%</td>
            </tr>
            `;
          }).join('')}
        </table>
        
        <div class="recommendations">
          <h2>Recommendations</h2>
          ${this.generateRecommendations(overallScore)}
        </div>
      </div>
      
      <script>
        // Create chart
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const categoryChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)))},
            datasets: [
              {
                label: 'Relevance',
                data: ${JSON.stringify(relevanceData)},
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
              },
              {
                label: 'Accuracy',
                data: ${JSON.stringify(accuracyData)},
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
              },
              {
                label: 'Helpfulness',
                data: ${JSON.stringify(helpfulnessData)},
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1
              }
            ]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Score (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Website Categories'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'AI Agent Performance by Website Section',
                font: {
                  size: 18
                }
              }
            },
            responsive: true,
            maintainAspectRatio: false
          }
        });
      </script>
    </body>
    </html>
    `;
    
    fs.writeFileSync(reportPath, htmlContent);
    console.log(`\nHTML report generated at: ${reportPath}`);
    return reportPath;
  }
  
  generateRecommendations(overallScore) {
    // Find the weakest categories
    const categoryScores = Object.keys(this.results).map(category => {
      const results = this.results[category];
      const relevance = (results.relevantResponses / results.questions) * 100;
      const accuracy = (results.accurateResponses / results.questions) * 100;
      const helpfulness = (results.helpfulResponses / results.questions) * 100;
      const avgScore = (relevance + accuracy + helpfulness) / 3;
      
      return {
        category,
        score: avgScore
      };
    });
    
    // Sort by score ascending to find weakest categories
    categoryScores.sort((a, b) => a.score - b.score);
    const weakestCategories = categoryScores.filter(cat => cat.score < 75);
    
    let recommendations = '';
    
    if (overallScore >= 90) {
      recommendations = `
        <p>The AI agent is performing excellently across all categories. To maintain this high level:</p>
        <ul>
          <li>Schedule regular updates to keep the AI's knowledge current with any website changes</li>
          <li>Continue collecting and analyzing user interactions to identify any edge cases</li>
          <li>Consider expanding the AI's capabilities for more complex user scenarios</li>
        </ul>
      `;
    } else if (overallScore >= 75) {
      const weakAreas = weakestCategories.length > 0 
        ? weakestCategories.map(cat => cat.category).join(', ') 
        : 'specific areas';
      
      recommendations = `
        <p>The AI agent is performing well but has room for improvement, particularly in ${weakAreas}:</p>
        <ul>
          <li>Enhance the AI's knowledge base for ${weakAreas}</li>
          <li>Review and improve response quality for edge cases</li>
          <li>Consider adding more examples for better context understanding</li>
        </ul>
      `;
    } else {
      recommendations = `
        <p>The AI agent needs significant improvements before deployment:</p>
        <ul>
          <li>Perform a comprehensive retraining with expanded dataset</li>
          <li>Focus on improving fundamentals: relevance, accuracy, and helpfulness</li>
          <li>Add more detailed information about ${weakestCategories.map(cat => cat.category).join(', ')}</li>
          <li>Consider implementing guided responses for common questions</li>
          <li>Develop a set of fallback responses for when confidence is low</li>
        </ul>
      `;
    }
    
    return recommendations;
  }
}

module.exports = ReportGenerator;