import { Groq } from 'groq-sdk';

class AIService {
  constructor() {
    this.groq = null;
    this.initializeGroq();
  }

  async initializeGroq() {
    try {
      // Initialize Groq with API key from environment
      this.groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.warn('Groq AI not available:', error.message);
    }
  }

  // Convert file to base64 data URL
  async fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Analyze uploaded receipt/bill image
  async analyzeReceiptImage(imageFile) {
    if (!this.groq) return this.getFallbackReceiptAnalysis();

    try {
      const imageDataURL = await this.fileToDataURL(imageFile);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this receipt/bill image and extract the following information:\n1. Total amount\n2. Items purchased with prices\n3. Restaurant/store name\n4. Date if visible\n5. Suggest how to split this bill among friends\n6. Money-saving tips for similar purchases\n\nProvide a clear, structured response.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataURL
                }
              }
            ]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0]?.message?.content || this.getFallbackReceiptAnalysis();
    } catch (error) {
      console.error('Receipt analysis failed:', error);
      return this.getFallbackReceiptAnalysis();
    }
  }

  // Analyze food image
  async analyzeFoodImage(imageFile) {
    if (!this.groq) return this.getFallbackFoodImageAnalysis();

    try {
      const imageDataURL = await this.fileToDataURL(imageFile);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and provide:\n1. Identify the food items\n2. Estimate nutritional information\n3. Suggest approximate cost/price range\n4. Recommend similar dishes\n5. Cooking tips if homemade\n6. Health and dietary insights\n\nBe detailed and helpful.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataURL
                }
              }
            ]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0]?.message?.content || this.getFallbackFoodImageAnalysis();
    } catch (error) {
      console.error('Food analysis failed:', error);
      return this.getFallbackFoodImageAnalysis();
    }
  }

  // Analyze trip/expense related image
  async analyzeTripImage(imageFile) {
    if (!this.groq) return this.getFallbackTripImageAnalysis();

    try {
      const imageDataURL = await this.fileToDataURL(imageFile);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this trip/expense related image and provide:\n1. Identify what type of expense this is\n2. Extract any visible amounts or prices\n3. Suggest budget categories\n4. Recommend cost-saving alternatives\n5. Trip planning insights\n6. Expense tracking tips\n\nBe practical and budget-focused.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataURL
                }
              }
            ]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0]?.message?.content || this.getFallbackTripImageAnalysis();
    } catch (error) {
      console.error('Trip analysis failed:', error);
      return this.getFallbackTripImageAnalysis();
    }
  }

  // General image analysis for any expense-related image
  async analyzeExpenseImage(imageFile, context = 'general') {
    if (!this.groq) return this.getFallbackExpenseAnalysis();

    try {
      const imageDataURL = await this.fileToDataURL(imageFile);

      let prompt = 'Analyze this expense-related image and provide insights about spending, budgeting, and money management.';

      if (context === 'receipt') {
        prompt = 'This is a receipt. Extract total amount, items, and suggest bill splitting strategies.';
      } else if (context === 'food') {
        prompt = 'This is food. Identify items, estimate costs, and provide dining insights.';
      } else if (context === 'trip') {
        prompt = 'This is trip-related. Analyze expenses and provide travel budgeting tips.';
      }

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt + '\n\nProvide:\n1. What you see in the image\n2. Financial insights\n3. Practical recommendations\n4. Money-saving tips'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataURL
                }
              }
            ]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.7,
        max_tokens: 800
      });

      return completion.choices[0]?.message?.content || this.getFallbackExpenseAnalysis();
    } catch (error) {
      console.error('Expense analysis failed:', error);
      return this.getFallbackExpenseAnalysis();
    }
  }

  async analyzeBillSplits(billData) {
    if (!this.groq) return this.getFallbackBillAnalysis(billData);

    try {
      const prompt = `Analyze this bill splitting data and provide insights:
      
Bill Details:
- Total Amount: ₹${billData.total}
- Number of People: ${billData.people.length}
- Per Person: ₹${billData.perPerson}
- People: ${billData.people.map(p => p.name).join(', ')}

Please provide:
1. Spending insights
2. Money-saving tips
3. Fair splitting suggestions
4. Budget recommendations

Keep it concise and practical.`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || this.getFallbackBillAnalysis(billData);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackBillAnalysis(billData);
    }
  }

  async analyzeTripExpenses(tripData) {
    if (!this.groq) return this.getFallbackTripAnalysis(tripData);

    try {
      const totalSpent = tripData.reduce((sum, person) => sum + person.spent, 0);
      const avgSpent = totalSpent / tripData.length;

      const prompt = `Analyze this trip expense data and provide insights:
      
Trip Expenses:
- Total Spent: ₹${totalSpent}
- Number of People: ${tripData.length}
- Average per Person: ₹${avgSpent.toFixed(2)}
- Individual Spending: ${tripData.map(p => `${p.name}: ₹${p.spent}`).join(', ')}

Please provide:
1. Spending pattern analysis
2. Budget optimization tips
3. Fair settlement suggestions
4. Future trip planning advice

Keep it helpful and actionable.`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || this.getFallbackTripAnalysis(tripData);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackTripAnalysis(tripData);
    }
  }

  async analyzeFoodDiscovery(foodData) {
    if (!this.groq) return this.getFallbackFoodAnalysis(foodData);

    try {
      const prompt = `Analyze this food discovery data and provide insights:
      
Food Preferences:
${foodData.map(food => `- ${food.name}: ${food.description || 'No description'}`).join('\n')}

Please provide:
1. Dietary pattern analysis
2. Nutritional suggestions
3. Cost-effective alternatives
4. Meal planning tips
5. Restaurant recommendations

Keep it practical and health-focused.`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || this.getFallbackFoodAnalysis(foodData);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackFoodAnalysis(foodData);
    }
  }

  async getSpendingInsights(allData) {
    if (!this.groq) return this.getFallbackSpendingInsights(allData);

    try {
      const { bills, trips, food } = allData;

      const prompt = `Analyze overall spending patterns and provide comprehensive insights:
      
Recent Activity:
- Bill Splits: ${bills.length} transactions
- Trip Expenses: ${trips.length} trips
- Food Discoveries: ${food.length} items

Please provide:
1. Overall spending trends
2. Budget optimization strategies
3. Social dining insights
4. Money management tips
5. Personalized recommendations

Make it actionable and insightful.`;

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 600
      });

      return completion.choices[0]?.message?.content || this.getFallbackSpendingInsights(allData);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackSpendingInsights(allData);
    }
  }

  // Fallback responses when AI is not available
  getFallbackReceiptAnalysis() {
    return `📄 Receipt Analysis (Offline Mode):

🔍 What I can help with:
• Upload a clear image of your receipt
• I'll extract total amounts and items
• Suggest fair bill splitting methods
• Provide money-saving tips

💡 Tips for better analysis:
• Ensure good lighting and clear text
• Include the full receipt in the image
• Make sure amounts are visible

📱 Try uploading your receipt image for detailed analysis!`;
  }

  getFallbackFoodImageAnalysis() {
    return `🍽️ Food Analysis (Offline Mode):

🔍 What I can analyze:
• Identify food items and dishes
• Estimate nutritional information
• Suggest approximate costs
• Provide cooking and dining tips

💡 For best results:
• Upload clear, well-lit food photos
• Include multiple angles if possible
• Show the full dish or meal

📱 Upload a food image to get detailed insights!`;
  }

  getFallbackTripImageAnalysis() {
    return `✈️ Trip Analysis (Offline Mode):

🔍 What I can help with:
• Analyze travel expenses from images
• Categorize different types of costs
• Suggest budget optimization
• Provide travel money tips

💡 Upload images of:
• Hotel receipts
• Transportation tickets
• Activity costs
• Food expenses

📱 Share your trip expense images for analysis!`;
  }

  getFallbackExpenseAnalysis() {
    return `💰 Expense Analysis (Offline Mode):

🔍 AI Image Analysis Available:
• Receipt scanning and item extraction
• Food identification and cost estimation
• Trip expense categorization
• Budget optimization suggestions

💡 How to use:
• Upload clear images of receipts, food, or expenses
• Get instant AI-powered insights
• Receive personalized money-saving tips

📱 Upload an image to get started!`;
  }

  getFallbackTripAnalysis(tripData) {
    const total = tripData.reduce((sum, p) => sum + p.spent, 0);
    const avg = total / tripData.length;

    return `✈️ Trip Expense Insights:

📈 Spending Summary:
• Total expenses: ₹${total.toFixed(2)}
• Average per person: ₹${avg.toFixed(2)}
• ${tripData.length} participants

💡 Optimization Tips:
• Plan and budget before trips
• Share accommodation costs
• Cook some meals together
• Use public transport when possible

🎯 Settlement Advice:
• Settle expenses promptly
• Keep receipts for transparency
• Use digital payment methods`;
  }

  getFallbackFoodAnalysis(foodData) {
    return `🍽️ Food Discovery Insights:

📋 Your Preferences:
• ${foodData.length} food items discovered
• Diverse taste exploration

🥗 Suggestions:
• Try cooking some favorites at home
• Balance indulgent and healthy choices
• Explore local cuisines for variety
• Consider meal prep for savings

💰 Cost Tips:
• Look for lunch specials
• Share dishes with friends
• Try food festivals for variety`;
  }

  getFallbackSpendingInsights(allData) {
    return `📊 Overall Spending Insights:

🎯 Activity Summary:
• Regular social dining and splitting
• Active trip expense tracking
• Food exploration habits

💡 Recommendations:
• Set monthly dining budgets
• Plan group activities in advance
• Track spending patterns
• Look for group deals and discounts

🚀 Smart Tips:
• Use cashback apps
• Split costs fairly and promptly
• Try cooking together for savings
• Budget for both planned and spontaneous outings`;
  }
}

export default new AIService();