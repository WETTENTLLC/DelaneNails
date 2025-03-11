class DnncInitiatives {
    constructor() {
        this.initiatives = {
            "steps-to-success": {
                name: "DNNC Steps to Success",
                shortDescription: "Our nonprofit initiative empowering women through mentorship and career support.",
                fullDescription: "DNNC Steps to Success is our nonprofit initiative designed to help women overcome barriers to professional success through mentorship, education, and support.",
                mission: "To empower women to achieve financial independence and career fulfillment through targeted support and education.",
                programs: [
                    {
                        name: "Mentorship Program",
                        description: "Connecting women with experienced professionals in their field of interest for one-on-one guidance."
                    },
                    {
                        name: "Career Skills Workshops",
                        description: "Regular workshops covering resume building, interview techniques, professional communication, and more."
                    },
                    {
                        name: "Financial Literacy Education",
                        description: "Courses designed to build understanding of personal finance, budgeting, and investment basics."
                    }
                ],
                howToSupport: "You can support Steps to Success by purchasing our Truth & Freedom polish line, making a direct donation through our website, or volunteering your time and expertise as a mentor.",
                impact: "To date, we've helped over 50 women through our mentorship programs and workshops, with 78% reporting significant career advancement within one year."
            },
            "vision-2025": {
                name: "Vision 2025",
                shortDescription: "Our roadmap to expand from natural nail care into a complete wellness and beauty experience.",
                fullDescription: "In 2025, Delane's Natural Nail Care will expand into a full Medi Spa experience, integrating beauty, health, and wellness into one cohesive experience.",
                details: "Our Vision 2025 expansion focuses on holistic wellness, combining our expertise in natural nail care with new wellness services to address the complete health and beauty needs of our clients.",
                newServices: [
                    "Personalized skin treatments",
                    "Holistic wellness consultations",
                    "Nutritional guidance",
                    "Stress reduction therapies"
                ],
                goals: [
                    "Create an integrated approach to beauty and wellness",
                    "Expand our professional team to include licensed healthcare providers",
                    "Develop a line of wellness products to complement our beauty offerings",
                    "Provide a more comprehensive self-care experience for our clients"
                ],
                timeline: "We'll begin introducing select wellness services in 2023, with a gradual expansion through 2025 to our full-service medi spa concept."
            },
            "advanced-pedicures": {
                name: "Advanced Pedicure Program",
                shortDescription: "Specialized pedicure treatments addressing specific foot health concerns.",
                fullDescription: "Our Advanced Pedicure Program provides specialized treatments that go beyond aesthetics to address specific foot health concerns.",
                services: [
                    {
                        name: "Therapeutic Relief Pedicure",
                        description: "Designed for those with chronic foot pain or conditions like plantar fasciitis, incorporating targeted massage and specialized products.",
                        price: "$75",
                        duration: "75 min"
                    },
                    {
                        name: "Diabetic Foot Care Pedicure",
                        description: "A gentle, medical-focused pedicure specifically designed for clients with diabetes, emphasizing safety and careful attention.",
                        price: "$70",
                        duration: "60 min"
                    },
                    {
                        name: "Athletic Recovery Pedicure",
                        description: "Perfect for runners and athletes, this service focuses on muscle recovery, callus management, and nail health for active individuals.",
                        price: "$80",
                        duration: "90 min"
                    }
                ],
                specialist: "These advanced pedicures are performed by our certified Advanced Pedicure Specialists who have additional training in foot health conditions.",
                bookingInfo: "Advanced Pedicures require a brief consultation before your first appointment to ensure we address your specific needs correctly."
            }
        };
    }

    getInitiativeInfo(initiative) {
        const normalizedInitiative = initiative.toLowerCase().replace(/\s+/g, '-');
        return this.initiatives[normalizedInitiative] || null;
    }

    searchInitiatives(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        
        const normalizedQuery = query.toLowerCase().trim();
        const results = [];
        
        Object.entries(this.initiatives).forEach(([key, initiative]) => {
            if (
                initiative.name.toLowerCase().includes(normalizedQuery) ||
                initiative.shortDescription.toLowerCase().includes(normalizedQuery) ||
                initiative.fullDescription.toLowerCase().includes(normalizedQuery)
            ) {
                results.push({
                    id: key,
                    ...initiative
                });
            }
        });
        
        return results;
    }
    
    getDnncDescription() {
        return "DNNC stands for Delane's Natural Nail Care, our salon's full name. Beyond being a nail salon, DNNC encompasses our community initiatives like Steps to Success, our Vision 2025 expansion plan, and our Advanced Pedicure Program. We believe in beauty with purpose and community impact.";
    }
    
    formatInitiativeResponse(initiative) {
        if (!initiative) {
            return "I'm not familiar with that specific initiative. We have DNNC Steps to Success (our nonprofit for women's empowerment), Vision 2025 (our expansion plan), and our Advanced Pedicure Program. Which one would you like to learn about?";
        }
        
        let response = `**${initiative.name}**\n\n${initiative.fullDescription}\n\n`;
        
        if (initiative.mission) {
            response += `**Mission:** ${initiative.mission}\n\n`;
        }
        
        if (initiative.programs) {
            response += "**Programs:**\n";
            initiative.programs.forEach(program => {
                response += `- ${program.name}: ${program.description}\n`;
            });
            response += "\n";
        }
        
        if (initiative.services) {
            response += "**Services:**\n";
            initiative.services.forEach(service => {
                response += `- ${service.name} (${service.price}, ${service.duration}): ${service.description}\n`;
            });
            response += "\n";
        }
        
        if (initiative.howToSupport) {
            response += `**How to Support:** ${initiative.howToSupport}\n\n`;
        }
        
        if (initiative.bookingInfo) {
            response += `**Booking Information:** ${initiative.bookingInfo}\n\n`;
        }
        
        return response;
    }
}

// Export the DNNC initiatives class
window.DnncInitiatives = DnncInitiatives;
