import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import EmojiPicker from 'emoji-picker-react';

const ClipartTab = ({ 
  setShowClipartTab, 
  addEmojiTextToCanvas, 
  lastProduct, 
  handleAddDesignToCanvas,
  addIconToCanvas
}) => {
  const [view, setView] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [iconCollections, setIconCollections] = useState([]);
  const [selectedIcons, setSelectedIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIconCollections();
  }, []);

  const fetchIconCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.iconify.design/collections');
      const collections = await response.json();
      
      const popularCollections = Object.entries(collections)
        .filter(([key, collection]) => collection.total > 100) 
        .sort((a, b) => b[1].total - a[1].total) 
        .slice(0, 30) 
        .map(([key, collection]) => ({
          id: key,
          name: collection.name,
          total: collection.total,
          author: collection.author?.name || 'Unknown',
          license: collection.license?.title || 'Unknown',
          category: collection.category || 'General',
          palette: collection.palette || false
        }));

      setIconCollections(popularCollections);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch icon collections:', error);
      setLoading(false);
      
      setIconCollections([
        { id: 'material-symbols', name: 'Material Symbols', total: 2500, category: 'Google' },
        { id: 'lucide', name: 'Lucide', total: 1000, category: 'Interface' },
        { id: 'heroicons', name: 'Heroicons', total: 300, category: 'Interface' },
        { id: 'tabler', name: 'Tabler Icons', total: 2000, category: 'Interface' },
        { id: 'carbon', name: 'Carbon Design', total: 1200, category: 'IBM' },
        { id: 'fluent', name: 'Fluent UI', total: 1500, category: 'Microsoft' },
        { id: 'ant-design', name: 'Ant Design', total: 800, category: 'Interface' },
        { id: 'bootstrap', name: 'Bootstrap Icons', total: 1600, category: 'Bootstrap' },
        { id: 'feather', name: 'Feather', total: 300, category: 'Interface' },
        { id: 'phosphor', name: 'Phosphor', total: 1200, category: 'Interface' },
        { id: 'mdi', name: 'Material Design Icons', total: 7000, category: 'Google' },
        { id: 'fa', name: 'Font Awesome', total: 2000, category: 'Popular' },
        { id: 'iconoir', name: 'Iconoir', total: 1300, category: 'Interface' },
        { id: 'solar', name: 'Solar Icons', total: 7000, category: 'Design' },
        { id: 'mingcute', name: 'Mingcute', total: 2500, category: 'Design' }
      ]);
    }
  };

  const shapeTemplates = [
    { name: 'Circle', svg: '<circle cx="50" cy="50" r="40" fill="#3B82F6"/>', category: 'basic' },
    { name: 'Square', svg: '<rect x="10" y="10" width="80" height="80" fill="#EF4444"/>', category: 'basic' },
    { name: 'Triangle', svg: '<polygon points="50,10 90,90 10,90" fill="#10B981"/>', category: 'basic' },
    { name: 'Heart', svg: '<path d="M50,90 C50,90 10,50 10,30 C10,20 20,10 30,10 C40,10 50,20 50,30 C50,20 60,10 70,10 C80,10 90,20 90,30 C90,50 50,90 50,90 Z" fill="#F59E0B"/>', category: 'symbols' },
    { name: 'Star', svg: '<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#8B5CF6"/>', category: 'symbols' },
    { name: 'Diamond', svg: '<polygon points="50,10 90,50 50,90 10,50" fill="#06B6D4"/>', category: 'basic' },
    { name: 'Hexagon', svg: '<polygon points="25,7 75,7 100,43 75,79 25,79 0,43" fill="#84CC16"/>', category: 'basic' },
    { name: 'Arrow Right', svg: '<polygon points="10,20 60,20 60,10 90,40 60,70 60,60 10,60" fill="#F97316"/>', category: 'arrows' },
    { name: 'Arrow Up', svg: '<polygon points="40,10 70,40 60,40 60,90 20,90 20,40 10,40" fill="#EC4899"/>', category: 'arrows' },
    { name: 'Arrow Down', svg: '<polygon points="40,90 10,60 20,60 20,10 60,10 60,60 70,60" fill="#14B8A6"/>', category: 'arrows' },
    { name: 'Oval', svg: '<ellipse cx="50" cy="50" rx="45" ry="30" fill="#F472B6"/>', category: 'basic' },
    { name: 'Pentagon', svg: '<polygon points="50,10 85,35 75,75 25,75 15,35" fill="#10B981"/>', category: 'basic' },
    { name: 'Octagon', svg: '<polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="#8B5CF6"/>', category: 'basic' },
    { name: 'Cross', svg: '<polygon points="35,10 65,10 65,35 90,35 90,65 65,65 65,90 35,90 35,65 10,65 10,35 35,35" fill="#DC2626"/>', category: 'symbols' }
  ];

  const typographyElements = [
    { name: 'Heading', text: 'HEADING', fontSize: 32, fontWeight: 'bold', fontFamily: 'Arial' },
    { name: 'Subheading', text: 'Subheading', fontSize: 24, fontWeight: '600', fontFamily: 'Georgia' },
    { name: 'Body Text', text: 'Body Text', fontSize: 16, fontWeight: 'normal', fontFamily: 'Helvetica' },
    { name: 'Script', text: 'Script Text', fontSize: 28, fontWeight: 'normal', fontFamily: 'Brush Script MT' },
    { name: 'Display', text: 'DISPLAY', fontSize: 36, fontWeight: 'bold', fontFamily: 'Impact' },
    { name: 'Serif', text: 'Serif Text', fontSize: 20, fontWeight: 'normal', fontFamily: 'Times New Roman' },
    { name: 'Monospace', text: 'Code Text', fontSize: 18, fontWeight: 'normal', fontFamily: 'Courier New' },
    { name: 'Italic', text: 'Italic Text', fontSize: 20, fontWeight: 'normal', fontFamily: 'Georgia', style: 'italic' },
    { name: 'Bold Sans', text: 'BOLD SANS', fontSize: 24, fontWeight: 'bold', fontFamily: 'Helvetica' },
    { name: 'Thin', text: 'Thin Text', fontSize: 22, fontWeight: '100', fontFamily: 'Helvetica' }
  ];

  const decorativeElements = [
    { name: 'Flourish 1', svg: '<path d="M10,50 Q30,10 50,50 Q70,90 90,50" stroke="#9333EA" stroke-width="3" fill="none"/>', category: 'lines' },
    { name: 'Border 1', svg: '<rect x="5" y="5" width="90" height="90" fill="none" stroke="#DC2626" stroke-width="4" stroke-dasharray="10,5"/>', category: 'borders' },
    { name: 'Swirl', svg: '<path d="M20,20 Q50,10 80,40 Q70,70 40,60 Q30,40 50,30" stroke="#059669" stroke-width="3" fill="none"/>', category: 'lines' },
    { name: 'Dots Pattern', svg: '<circle cx="20" cy="20" r="3" fill="#7C3AED"/><circle cx="50" cy="20" r="3" fill="#7C3AED"/><circle cx="80" cy="20" r="3" fill="#7C3AED"/><circle cx="20" cy="50" r="3" fill="#7C3AED"/><circle cx="50" cy="50" r="3" fill="#7C3AED"/><circle cx="80" cy="50" r="3" fill="#7C3AED"/><circle cx="20" cy="80" r="3" fill="#7C3AED"/><circle cx="50" cy="80" r="3" fill="#7C3AED"/><circle cx="80" cy="80" r="3" fill="#7C3AED"/>', category: 'patterns' },
    { name: 'Ribbon', svg: '<path d="M10,30 L70,30 L80,40 L70,50 L10,50 L20,40 Z" fill="#DC2626"/>', category: 'banners' },
    { name: 'Crown', svg: '<polygon points="20,60 30,40 40,50 50,30 60,50 70,40 80,60 20,60" fill="#F59E0B"/>', category: 'symbols' },
    { name: 'Wave 1', svg: '<path d="M10,50 Q25,30 40,50 T70,50 T100,50" stroke="#3B82F6" stroke-width="4" fill="none"/>', category: 'lines' },
    { name: 'Zigzag', svg: '<polyline points="10,30 30,70 50,30 70,70 90,30" stroke="#EF4444" stroke-width="3" fill="none"/>', category: 'lines' },
    { name: 'Circle Border', svg: '<circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" stroke-width="6"/>', category: 'borders' },
    { name: 'Double Line', svg: '<line x1="10" y1="40" x2="90" y2="40" stroke="#8B5CF6" stroke-width="3"/><line x1="10" y1="60" x2="90" y2="60" stroke="#8B5CF6" stroke-width="3"/>', category: 'lines' },
    { name: 'Ornament 1', svg: '<path d="M50,20 C60,30 60,40 50,50 C40,40 40,30 50,20 Z M50,50 C60,60 60,70 50,80 C40,70 40,60 50,50 Z" fill="#F59E0B"/>', category: 'ornaments' },
    { name: 'Branch', svg: '<path d="M20,80 Q30,60 50,50 Q70,40 80,20 M40,70 Q50,55 60,45 M30,65 Q40,60 50,55" stroke="#059669" stroke-width="2" fill="none"/>', category: 'nature' }
  ];

  const thematicCollections = [
    { name: 'Business', items: ['briefcase', 'chart-line', 'handshake', 'presentation', 'target'], icon: '💼' },
    { name: 'Nature', items: ['tree', 'leaf', 'flower', 'sun', 'mountain'], icon: '🌿' },
    { name: 'Technology', items: ['laptop', 'smartphone', 'wifi', 'database', 'code'], icon: '💻' },
    { name: 'Sports', items: ['football', 'basketball', 'tennis', 'trophy', 'medal'], icon: '⚽' },
    { name: 'Food', items: ['pizza', 'burger', 'coffee', 'cake', 'apple'], icon: '🍕' },
    { name: 'Travel', items: ['airplane', 'suitcase', 'camera', 'map', 'passport'], icon: '✈️' },
    { name: 'Medical', items: ['heart', 'hospital', 'medicine', 'stethoscope', 'ambulance'], icon: '🏥' },
    { name: 'Education', items: ['book', 'school', 'graduate', 'pencil', 'calculator'], icon: '📚' },
    { name: 'Communication', items: ['phone', 'email', 'chat', 'message', 'notification'], icon: '📱' },
    { name: 'Transportation', items: ['car', 'bus', 'train', 'bicycle', 'ship'], icon: '🚗' }
  ];

  const fetchIconsFromCollection = async (collectionId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.iconify.design/collection?prefix=${collectionId}`);
      const data = await response.json();
      
      if (data.uncategorized) {
        const icons = data.uncategorized.slice(0, 200).map(iconName => ({
          name: `${collectionId}:${iconName}`,
          displayName: iconName.replace(/-/g, ' ').replace(/_/g, ' '),
          collection: collectionId,
          category: 'uncategorized'
        }));
        
        setSelectedIcons(icons);
      } else if (data.categories) {
        const allIcons = [];
        Object.entries(data.categories).forEach(([category, iconNames]) => {
          iconNames.slice(0, 50).forEach(iconName => {
            allIcons.push({
              name: `${collectionId}:${iconName}`,
              displayName: iconName.replace(/-/g, ' ').replace(/_/g, ' '),
              collection: collectionId,
              category: category
            });
          });
        });
        setSelectedIcons(allIcons.slice(0, 200));
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch icons:', error);
      setLoading(false);
    }
  };

  const searchIcons = async (query) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const collections = ['material-symbols', 'lucide', 'heroicons', 'tabler', 'carbon', 'mdi', 'fa', 'bootstrap'];
      const searchPromises = collections.map(async (collection) => {
        try {
          const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=15&prefix=${collection}`);
          const data = await response.json();
          return (data.icons || []).map(iconName => ({
            name: iconName,
            displayName: iconName.split(':')[1]?.replace(/-/g, ' ').replace(/_/g, ' ') || iconName,
            collection: iconName.split(':')[0]
          }));
        } catch {
          return [];
        }
      });
      
      const results = await Promise.all(searchPromises);
      const allIcons = results.flat();
      
      setSelectedIcons(allIcons.slice(0, 100)); 
      setLoading(false);
    } catch (error) {
      console.error('Search failed:', error);
      setLoading(false);
    }
  };

  const emojiCategories = [
    { id: 'smileys_people', name: 'Smileys & People', emoji: '😀' },
    { id: 'animals_nature', name: 'Animals & Nature', emoji: '🐶' },
    { id: 'food_drink', name: 'Food & Drink', emoji: '🍎' },
    { id: 'travel_places', name: 'Travel & Places', emoji: '🚗' },
    { id: 'activities', name: 'Activities', emoji: '⚽' },
    { id: 'objects', name: 'Objects', emoji: '💡' },
    { id: 'symbols', name: 'Symbols', emoji: '❤️' },
    { id: 'flags', name: 'Flags', emoji: '🏳️' }
  ];

  const mainCategories = useMemo(() => {
    const categories = [];
    
    if (lastProduct?.designs?.length > 0) {
      categories.push({
        id: 'designs',
        name: 'Designs',
        icon: '🎨',
        count: lastProduct.designs.length,
        description: 'Custom designs for this product'
      });
    }
    
    if (lastProduct?.patterns?.length > 0) {
      categories.push({
        id: 'patterns',
        name: 'Patterns', 
        icon: '🌟',
        count: lastProduct.patterns.length,
        description: 'Pattern designs for this product'
      });
    }

    categories.push(
      {
        id: 'emoji',
        name: 'Emoji',
        icon: '😀',
        count: '3000+',
        description: 'All emoji categories with picker'
      },
      {
        id: 'shapes',
        name: 'Shapes',
        icon: '🔴',
        count: shapeTemplates.length,
        description: 'Basic shapes and geometric forms'
      },
      {
        id: 'illustrations',
        name: 'Illustrations',
        icon: '🖼️',
        count: iconCollections.length,
        description: '30+ professional icon libraries'
      },
      {
        id: 'typography',
        name: 'Typography',
        icon: 'Aa',
        count: typographyElements.length,
        description: 'Text styles and fonts'
      },
      {
        id: 'decorative',
        name: 'Decorative',
        icon: '✨',
        count: decorativeElements.length,
        description: 'Decorative elements and ornaments'
      },
      {
        id: 'icons',
        name: 'Icons',
        icon: '⭐',
        count: iconCollections.length,
        description: 'Professional icon collections'
      },
      {
        id: 'thematic',
        name: 'Thematic',
        icon: '🎯',
        count: thematicCollections.length,
        description: 'Themed icon collections'
      },
      {
        id: 'search-icons',
        name: 'Search Icons',
        icon: '🔍',
        count: '100K+',
        description: 'Search across all icon collections'
      }
    );

    return categories;
  }, [lastProduct, iconCollections, shapeTemplates.length, typographyElements.length, decorativeElements.length, thematicCollections.length]);

  const handleMainCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    
    if (categoryId === 'search-icons') {
      setSelectedIcons([]);
    }
    
    setView(categoryId);
  };

  const handleIconCollectionClick = async (collectionId) => {
    setSelectedCategory(collectionId);
    await fetchIconsFromCollection(collectionId);
    setView('icon-list');
  };

  const handleBack = () => {
    if (view === 'icon-list') {
      setView('icons');
    } else if (view === 'thematic-icons') {
      setView('thematic');
    } else if (view === 'emoji-categories') {
      setView('emoji');
    } else {
      setView('main');
    }
    setSearchQuery('');
    setSelectedIcons([]);
  };

  const handleEmojiClick = (emojiData) => {
    addEmojiTextToCanvas(emojiData.emoji);
  };

  const handleIconClick = (iconData) => {
    if (addIconToCanvas) {
      addIconToCanvas(iconData);
    }
  };

  const addShapeToCanvas = (shape) => {
    if (!handleAddDesignToCanvas) return;

    const svgData = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">${shape.svg}</svg>`;
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    handleAddDesignToCanvas(svgUrl, 'center', 0, 0);
    
    setTimeout(() => {
      URL.revokeObjectURL(svgUrl);
    }, 1000);
  };

  const addTypographyToCanvas = (typography) => {
    if (!addEmojiTextToCanvas) return;

    addEmojiTextToCanvas(typography.text);
  };

  const addDecorativeToCanvas = (decorative) => {
    if (!handleAddDesignToCanvas) return;

    const svgData = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">${decorative.svg}</svg>`;
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    handleAddDesignToCanvas(svgUrl, 'center', 0, 0);

    setTimeout(() => {
      URL.revokeObjectURL(svgUrl);
    }, 1000);
  };

  const fetchThematicIcons = async (themeName) => {
    const theme = thematicCollections.find(t => t.name === themeName);
    if (!theme) return;

    try {
      setLoading(true);
      const iconPromises = theme.items.map(async (item) => {
        try {
          const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(item)}&limit=5&prefix=material-symbols`);
          const data = await response.json();
          return (data.icons || []).map(iconName => ({
            name: iconName,
            displayName: iconName.split(':')[1]?.replace(/-/g, ' ').replace(/_/g, ' ') || iconName,
            collection: iconName.split(':')[0],
            theme: themeName
          }));
        } catch {
          return [];
        }
      });
      
      const results = await Promise.all(iconPromises);
      const allIcons = results.flat();
      
      setSelectedIcons(allIcons.slice(0, 50));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch thematic icons:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (view === 'search-icons' && query.length > 2) {
      const timeoutId = setTimeout(() => {
        searchIcons(query);
      }, 500); 
      
      return () => clearTimeout(timeoutId);
    }
  };

  const filteredIcons = useMemo(() => {
    if (!searchQuery || view !== 'icon-list') return selectedIcons;
    
    return selectedIcons.filter(icon => 
      icon.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedIcons, searchQuery, view]);

  const getHeaderTitle = () => {
    const backIcon = (
      <img 
        src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1750138078/chevron-right_p6kmcp.svg" 
        className="rotate-180 w-4" 
      />
    );
    
    const titles = {
      'main': 'Clipart & Icons',
      'emoji': 'Emoji Picker',
      'shapes': 'Shapes',
      'illustrations': 'Icon Collections',
      'typography': 'Typography',
      'decorative': 'Decorative',
      'icons': 'Icons',
      'thematic': 'Thematic Collections',
      'search-icons': 'Search Icons',
      'icon-list': `${selectedCategory} Icons`,
      'thematic-icons': `${selectedCategory} Icons`,
      'designs': 'Product Designs',
      'patterns': 'Product Patterns'
    };
    
    if (view === 'main') return titles[view];
    
    return (
      <span className='flex items-center gap-1 cursor-pointer' onClick={handleBack}>
        {backIcon}
        <span className='text-[16px] text-black font-semibold'>
          {titles[view] || 'Back'}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-[#D3DBDF] w-80 h-fit max-h-[500px] overflow-y-auto">
      <div className='flex items-center justify-between py-2 px-3'>
        <h3 className='text-[16px] text-black font-semibold'>
          {getHeaderTitle()}
        </h3>
        <div className="cursor-pointer" onClick={() => setShowClipartTab(false)}>
          <img src="https://res.cloudinary.com/dd9tagtiw/image/upload/v1749341803/Vector_hm0yzo.png" alt="Close" />
        </div>
      </div>
      <hr className="border-t border-[#D3DBDF]" />

      {(view === 'search-icons' || view === 'icon-list') && (
        <div className='py-3 px-3'>
          <div className="relative">
            <input 
              type="search" 
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full p-3 text-sm pr-8 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" 
              placeholder={view === 'search-icons' ? "Search 100K+ icons..." : "Filter icons..."}
            />
            <div className="absolute inset-y-0 end-3 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}

      {view === 'main' && !loading && (
        <div className="p-3 space-y-3">
          {mainCategories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => handleMainCategoryClick(category.id)} 
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
            >
              <div className="text-2xl mr-3">{category.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{category.name}</div>
                <div className="text-xs text-gray-500">{category.description}</div>
                <div className="text-xs text-blue-600">{category.count} items</div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {view === 'emoji' && (
        <div className="p-3">
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            width="100%"
            height={400}
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}

      {view === 'shapes' && !loading && (
        <div className="p-3">
          <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto">
            {shapeTemplates.map((shape, index) => (
              <div
                key={index}
                onClick={() => addShapeToCanvas(shape)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                title={shape.name}
              >
                <div 
                  className="w-12 h-12 mb-1 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${shape.svg}</svg>`
                  }}
                />
                <span className="text-xs text-gray-500 text-center truncate w-full">
                  {shape.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'typography' && !loading && (
        <div className="p-3">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {typographyElements.map((typography, index) => (
              <div
                key={index}
                onClick={() => addTypographyToCanvas(typography)}
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100"
              >
                <div className="flex-1">
                  <div 
                    className="text-gray-800"
                    style={{
                      fontSize: `${Math.min(typography.fontSize, 20)}px`,
                      fontWeight: typography.fontWeight,
                      fontFamily: typography.fontFamily,
                      fontStyle: typography.style || 'normal'
                    }}
                  >
                    {typography.text}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {typography.name} • {typography.fontFamily}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'decorative' && !loading && (
        <div className="p-3">
          <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
            {decorativeElements.map((decorative, index) => (
              <div
                key={index}
                onClick={() => addDecorativeToCanvas(decorative)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                title={decorative.name}
              >
                <div 
                  className="w-16 h-16 mb-1 flex items-center justify-center"
                  dangerouslySetInnerHTML={{
                    __html: `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${decorative.svg}</svg>`
                  }}
                />
                <span className="text-xs text-gray-500 text-center truncate w-full">
                  {decorative.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'illustrations' && !loading && (
        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
          {iconCollections.map((collection) => (
            <div 
              key={collection.id}
              onClick={() => handleIconCollectionClick(collection.id)}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
            >
              <div className="mr-3 w-8 h-8 flex items-center justify-center">
                <Icon 
                  icon={`${collection.id}:home`} 
                  width={20} 
                  height={20} 
                  className="text-gray-600"
                  onError={() => (
                    <Icon icon={`${collection.id}:star`} width={20} height={20} className="text-gray-600" />
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{collection.name}</div>
                <div className="text-xs text-gray-500">
                  {collection.total.toLocaleString()} icons • {collection.category}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {view === 'icons' && !loading && (
        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
          {iconCollections.map((collection) => (
            <div 
              key={collection.id}
              onClick={() => handleIconCollectionClick(collection.id)}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
            >
              <div className="mr-3 w-8 h-8 flex items-center justify-center">
                <Icon 
                  icon={`${collection.id}:home`} 
                  width={20} 
                  height={20} 
                  className="text-gray-600"
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{collection.name}</div>
                <div className="text-xs text-gray-500">
                  {collection.total.toLocaleString()} icons • {collection.category}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {view === 'thematic' && !loading && (
        <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
          {thematicCollections.map((theme) => (
            <div 
              key={theme.name}
              onClick={() => {
                setSelectedCategory(theme.name);
                fetchThematicIcons(theme.name);
                setView('thematic-icons');
              }}
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
            >
              <div className="mr-3 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
                <span className="text-sm">{theme.icon}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{theme.name}</div>
                <div className="text-xs text-gray-500">
                  {theme.items.length} categories
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {(view === 'icon-list' || view === 'thematic-icons') && !loading && (
        <div className="p-3">
          <div className="grid grid-cols-6 gap-3 max-h-80 overflow-y-auto">
            {filteredIcons.map((icon, index) => (
              <div
                key={index}
                onClick={() => handleIconClick(icon)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                title={icon.displayName}
              >
                <Icon icon={icon.name} width={24} height={24} className="text-gray-700 mb-1" />
                <span className="text-xs text-gray-500 text-center truncate w-full">
                  {icon.displayName.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            ))}
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="material-symbols:search-off" width={48} height={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No icons found</p>
              <p className="text-xs mt-1">Try a different collection</p>
            </div>
          )}
        </div>
      )}

      {view === 'search-icons' && !loading && (
        <div className="p-3">
          <div className="grid grid-cols-6 gap-3 max-h-80 overflow-y-auto">
            {selectedIcons.map((icon, index) => (
              <div
                key={index}
                onClick={() => handleIconClick(icon)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                title={icon.displayName}
              >
                <Icon icon={icon.name} width={24} height={24} className="text-gray-700 mb-1" />
                <span className="text-xs text-gray-500 text-center truncate w-full">
                  {icon.displayName.split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            ))}
          </div>
          
          {view === 'search-icons' && searchQuery.length <= 2 && (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="material-symbols:search" width={48} height={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Type 3+ characters to search 100K+ icons</p>
              <p className="text-xs mt-1">Search across Material, Lucide, Heroicons, and more!</p>
            </div>
          )}
          
          {selectedIcons.length === 0 && searchQuery.length > 2 && (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="material-symbols:search-off" width={48} height={48} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No icons found for "{searchQuery}"</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}

      {view === 'designs' && (
        <div className="grid grid-cols-3 gap-2 p-3 max-h-80 overflow-y-auto">
          {lastProduct.designs?.map((design, index) => (
            <img
              key={index}
              src={design.url}
              alt={`design-${index}`}
              className="w-20 h-20 object-contain cursor-pointer border border-gray-200 rounded hover:border-blue-500 p-1 transition-colors"
              onClick={() => handleAddDesignToCanvas(design.url, design.position, design.offsetX, design.offsetY)}
            />
          ))}
        </div>
      )}

      {view === 'patterns' && (
        <div className="grid grid-cols-3 gap-2 p-3 max-h-80 overflow-y-auto">
          {lastProduct.patterns?.map((pattern, index) => (
            <img
              key={index}
              src={pattern.url}
              alt={`pattern-${index}`}
              className="w-20 h-20 object-contain cursor-pointer border border-gray-200 rounded hover:border-blue-500 p-1 transition-colors"
              onClick={() => handleAddDesignToCanvas(pattern.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClipartTab;