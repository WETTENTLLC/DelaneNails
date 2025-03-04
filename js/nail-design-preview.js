/**
 * Nail Design Preview
 * Provides visual previews of nail designs and styles
 */

const NailDesignPreview = {
    designs: {},
    recentPreviews: [],
    previewNode: null,
    modalActive: false,
    
    init: function() {
        console.log('Initializing Nail Design Preview module...');
        
        // Load design data
        this.loadDesignData();
        
        // Create preview container
        this.createPreviewDOM();
        
        return this;
    },
    
    loadDesignData: function() {
        // Categories of designs
        this.designs = {
            styles: [
                { id: 'french', name: 'French Manicure', description: 'Classic white tips on a natural pink base' },
                { id: 'ombre', name: 'Ombre', description: 'Gradient effect blending two or more colors' },
                { id: 'glitter', name: 'Glitter', description: 'Sparkly finish with various glitter options' },
                { id: 'matte', name: 'Matte', description: 'Non-shiny, sophisticated finish' },
                { id: 'chrome', name: 'Chrome', description: 'Metallic, mirror-like finish' },
                { id: 'neon', name: 'Neon', description: 'Bright, vibrant colors that stand out' }
            ],
            art: [
                { id: 'minimal', name: 'Minimalist', description: 'Simple, elegant designs with clean lines' },
                { id: 'floral', name: 'Floral', description: 'Flower patterns and natural motifs' },
                { id: 'geometric', name: 'Geometric', description: 'Shapes, lines, and patterns with precise edges' },
                { id: 'abstract', name: 'Abstract', description: 'Free-form artistic designs' },
                { id: 'seasonal', name: 'Seasonal', description: 'Holiday and season-specific themes' },
                { id: 'animal', name: 'Animal Print', description: 'Leopard spots, zebra stripes, and other animal patterns' }
            ],
            shapes: [
                { id: 'round', name: 'Round', description: 'Soft circular shape, ideal for short nails' },
                { id: 'square', name: 'Square', description: 'Straight edge with squared-off corners' },
                { id: 'oval', name: 'Oval', description: 'Rounded edge, elongates fingers' },
                { id: 'almond', name: 'Almond', description: 'Tapered sides with a rounded peak' },
                { id: 'stiletto', name: 'Stiletto', description: 'Dramatic, pointed shape' },
                { id: 'coffin', name: 'Coffin/Ballerina', description: 'Tapered shape with a flat tip' }
            ],
            // Add paths to actual design images
            images: {
                french: [
                    '/images/designs/french-classic.jpg',
                    '/images/designs/french-colored.jpg',
                    '/images/designs/french-glitter.jpg'
                ],
                ombre: [
                    '/images/designs/ombre-pink.jpg',
                    '/images/designs/ombre-blue.jpg'
                ],
                // Default fallback images if specific design images aren't available
                default: [
                    '/images/designs/default-design.jpg',
                    '/images/designs/default-design2.jpg'
                ]
            }
        };
    },
    
    createPreviewDOM: function() {
        // Create preview modal if it doesn't exist
        if (!document.getElementById('nail-design-preview-modal')) {
            const modal = document.createElement('div');
            modal.id = 'nail-design-preview-modal';
            modal.className = 'nail-design-modal';
            modal.style.display = 'none';
            
            modal.innerHTML = `
                <div class="nail-preview-content">
                    <span class="nail-preview-close">&times;</span>
                    <h3 class="nail-preview-title">Nail Design Preview</h3>
                    <div class="nail-preview-image-container">
                        <div class="nail-preview-loading">Loading preview...</div>
                        <img class="nail-preview-image" alt="Nail design preview">
                    </div>
                    <div class="nail-preview-info">
                        <h4 class="nail-preview-design-name"></h4>
                        <p class="nail-preview-description"></p>
                    </div>
                    <div class="nail-preview-controls">
                        <button class="nail-preview-prev">Previous</button>
                        <button class="nail-preview-book">Book This Design</button>
                        <button class="nail-preview-next">Next</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add modal styles
            const styles = document.createElement('style');
            styles.innerHTML = `
                .nail-design-modal {
                    display: none;
                    position: fixed;
                    z-index: 10001;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    overflow: auto;
                }
                
                .nail-preview-content {
                    position: relative;
                    background-color: #fff;
                    margin: 10% auto;
                    padding: 20px;
                    width: 80%;
                    max-width: 600px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }
                
                .nail-preview-close {
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .nail-preview-image-container {
                    position: relative;
                    width: 100%;
                    height: 300px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #f8f8f8;
                    border-radius: 5px;
                    overflow: hidden;
                    margin-bottom: 15px;
                }
                
                .nail-preview-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                
                .nail-preview-loading {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #9333ea;
                }
                
                .nail-preview-controls {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                }
                
                .nail-preview-controls button {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    background-color: #f0f0f0;
                }
                
                .nail-preview-book {
                    background-color: #9333ea !important;
                    color: white;
                }
                
                .nail-preview-design-name {
                    margin: 0 0 10px 0;
                }
            `;
            document.head.appendChild(styles);
            
            // Add event listeners
            const closeBtn = modal.querySelector('.nail-preview-close');
            closeBtn.addEventListener('click', () => this.closePreview());
            
            // Close when clicking outside the modal content
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePreview();
                }
            });
            
            // Button event listeners
            modal.querySelector('.nail-preview-prev').addEventListener('click', () => this.showPrevDesign());
            modal.querySelector('.nail-preview-next').addEventListener('click', () => this.showNextDesign());
            modal.querySelector('.nail-preview-book').addEventListener('click', () => this.bookCurrentDesign());
            
            this.previewNode = modal;
        }
    },
    
    // Show design preview based on user request
    showDesignPreview: function(designType, specific = null) {
        console.log(`Showing design preview for: ${designType}, specific: ${specific}`);
        
        // Find relevant designs
        let designs;
        let title;
        
        if (designType === 'style' || designType === 'styles') {
            designs = this.designs.styles;
            title = 'Nail Style Preview';
        } else if (designType === 'art' || designType === 'nail art') {
            designs = this.designs.art;
            title = 'Nail Art Preview';
        } else if (designType === 'shape' || designType === 'shapes') {
            designs = this.designs.shapes;
            title = 'Nail Shape Preview';
        } else {
            // Try to match by specific design name
            const allDesigns = [...this.designs.styles, ...this.designs.art, ...this.designs.shapes];
            const matchedDesign = allDesigns.find(d => 
                d.id === designType.toLowerCase() || 
                d.name.toLowerCase().includes(designType.toLowerCase())
            );
            
            if (matchedDesign) {
                designs = [matchedDesign];
                title = `${matchedDesign.name} Preview`;
            } else {
                console.warn(`No matching designs found for: ${designType}`);
                return `I'm sorry, I don't have previews available for "${designType}" nail designs.`;
            }
        }
        
        // Filter by specific if provided
        if (specific) {
            designs = designs.filter(d => 
                d.id === specific.toLowerCase() || 
                d.name.toLowerCase().includes(specific.toLowerCase())
            );
            
            if (designs.length === 0) {
                console.warn(`No matching designs found for specific: ${specific}`);
                return `I'm sorry, I don't have previews available for "${specific}" nail designs.`;
            }
        }
        
        // Store current previews and index
        this.recentPreviews = designs;
        this.currentPreviewIndex = 0;
        
        // Show the modal with first design
        this.showPreviewModal(designs[0], title);
        
        return `I'm showing you a preview of ${designs[0].name}. You can navigate through different options in the preview window.`;
    },
    
    showPreviewModal: function(design, title = 'Nail Design Preview') {
        if (!this.previewNode) {
            console.error('Preview modal not initialized');
            return;
        }
        
        // Set modal content
        const modal = this.previewNode;
        modal.querySelector('.nail-preview-title').textContent = title;
        modal.querySelector('.nail-preview-design-name').textContent = design.name;
        modal.querySelector('.nail-preview-description').textContent = design.description;
        
        // Set loading state
        const loadingElement = modal.querySelector('.nail-preview-loading');
        loadingElement.style.display = 'flex';
        
        // Get image for this design
        const imageElement = modal.querySelector('.nail-preview-image');
        const imagePath = this.getDesignImagePath(design.id);
        
        // Load the image
        imageElement.onload = () => {
            loadingElement.style.display = 'none';
        };
        imageElement.onerror = () => {
            loadingElement.textContent = 'Could not load image';
        };
        imageElement.src = imagePath;
        
        // Show modal
        modal.style.display = 'block';
        this.modalActive = true;
        
        // Disable body scrolling
        document.body.style.overflow = 'hidden';
    },
    
    closePreview: function() {
        if (!this.previewNode) return;
        
        this.previewNode.style.display = 'none';
        this.modalActive = false;
        
        // Re-enable scrolling
        document.body.style.overflow = '';
    },
    
    showNextDesign: function() {
        if (!this.recentPreviews || this.recentPreviews.length ===