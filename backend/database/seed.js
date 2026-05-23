require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { client, init } = require('./db');

const B = '/product-images/';

const products = [
  { name:'Clean Whey Protein', category:'Sports Nutrition', sub:'Whey', flavor:'Chocolate', weight:'1 KG', servings:30, servingSize:'33g', protein:24, price:4600, badge:'Top Rated', inStock:true, img:B+'whey-brew-cafe.png', imgBg:'#dcebd4', sku:'TOC-CWP-BC-1K', description:'Whey Isolate & Concentrate enriched with prebiotics, probiotics & digestive enzymes. Sweetened naturally with Monk Fruit Extract — never sucralose.', tags:['24g Protein','No Added Sugar','No Gums','Digestive Enzymes','Clinically Tested'], variantKey:'Brew Café', variantMap:{'Brew Café':1,'Double Chocolate':2} },
  { name:'Double Chocolate Whey', category:'Sports Nutrition', sub:'Whey', flavor:'Chocolate', weight:'1 KG', servings:30, servingSize:'33g', protein:25, price:4600, badge:null, inStock:true, img:B+'whey-double-chocolate.png', imgBg:'#ede0d4', sku:'TOC-CWP-DC-1K', description:'Rich double-chocolate whey with 25g protein per scoop. Uses real cacao and no artificial sweeteners — just clean protein that tastes exactly as good as it sounds.', tags:['25g Protein','Real Cacao','No Sucralose','Lab Tested'], variantKey:'Double Chocolate', variantMap:{'Brew Café':1,'Double Chocolate':2} },
  { name:'Clean Raw Whey Protein', category:'Sports Nutrition', sub:'Raw Whey', flavor:'Unflavored', weight:'1 KG', servings:33, servingSize:'30g', protein:24, price:3800, badge:null, inStock:true, img:B+'whey-raw.png', imgBg:'#f0ece4', sku:'TOC-RWP-UF-1K', description:'Pure, unflavored whey concentrate with nothing added. Mix it into anything — smoothies, oats, pancakes. The cleanest base protein on the market.', tags:['24g Protein','Zero Flavoring','No Fillers','Grass-Fed','Lab Tested'], variantKey:'Unflavored', variantMap:{} },
  { name:'Signature High Protein Oats', category:'Oats & Breakfast', sub:'Protein Oats', flavor:'Chocolate', weight:'1 KG', servings:14, servingSize:'70g', protein:20, price:699, badge:'Bestseller', inStock:true, img:B+'oats-high-protein.png', imgBg:'#dcebd4', sku:'TOC-HPO-SG-1K', description:'Oats blended with clean whey protein, sweetened with Monk Fruit. 20g protein per bowl, high fibre, and no added sugar.', tags:['20g Protein','Monk Fruit','High Fibre','No Added Sugar','Gluten Free'], variantKey:'Mixed Berry', variantMap:{} },
  { name:'Premium Jumbo Rolled Oats', category:'Oats & Breakfast', sub:'Rolled Oats', flavor:'Unflavored', weight:'900g', servings:12, servingSize:'75g', protein:null, price:499, badge:null, inStock:true, img:B+'oats-jumbo.png', imgBg:'#f0ece4', sku:'TOC-JRO-UF-900', description:'Jumbo-rolled, stone-milled oats from regenerative farms. Extra-thick flakes hold texture through cooking.', tags:['Whole Grain','No Additives','High Fibre','Non-GMO'], variantKey:'900g', variantMap:{} },
  { name:'Signature Coffee Oats', category:'Oats & Breakfast', sub:'Flavoured Oats', flavor:'Classic', weight:'1 KG', servings:14, servingSize:'70g', protein:null, price:749, badge:'New', inStock:true, img:B+'oats-signature-coffee.png', imgBg:'#e8ddd4', sku:'TOC-SFO-CF-1K', description:'Cold-brew coffee meets clean oats. Real Arabica extract, no artificial flavours, no added sugar.', tags:['Real Arabica','No Added Sugar','Monk Fruit','High Fibre'], variantKey:'Coffee', variantMap:{'Coffee':6,'Mango':7} },
  { name:'Signature Mango Oats', category:'Oats & Breakfast', sub:'Flavoured Oats', flavor:'Honey', weight:'1 KG', servings:14, servingSize:'70g', protein:null, price:749, badge:'New', inStock:true, img:B+'oats-signature-mango.png', imgBg:'#f5ecd0', sku:'TOC-SFO-MG-1K', description:'Alphonso mango flavour in clean oats — zero artificial anything. Monk Fruit sweetened, high fibre.', tags:['Alphonso Flavour','Monk Fruit','No Added Sugar','High Fibre'], variantKey:'Mango', variantMap:{'Coffee':6,'Mango':7} },
  { name:'Natural PB Unsweetened', category:'Peanut Butter', sub:'Natural', flavor:'Classic', weight:'500g', servings:25, servingSize:'20g', protein:8, price:749, badge:null, inStock:true, img:B+'pb-natural.png', imgBg:'#f0ece0', sku:'TOC-PBN-UF-500', description:'Just peanuts. Nothing else — no palm oil, no hydrogenated fat, no added sugar.', tags:['100% Peanuts','No Palm Oil','No Added Sugar','No Hydrogenated Fat'], variantKey:'Natural', variantMap:{'Natural':8,'Jaggery':13} },
  { name:'Chocolate Creamy PB', category:'Peanut Butter', sub:'Flavoured', flavor:'Chocolate', weight:'500g', servings:25, servingSize:'20g', protein:8, price:689, badge:null, inStock:true, img:B+'pb-chocolate-creamy.png', imgBg:'#e8d8cc', sku:'TOC-PBC-CM-500', description:'Velvety smooth chocolate peanut butter made with real cacao. No palm oil, no sucralose.', tags:['Real Cacao','No Palm Oil','No Sucralose','No Hydrogenated Fat'], variantKey:'Creamy', variantMap:{'Creamy':9,'Crunchy':10} },
  { name:'Chocolate Crunchy PB', category:'Peanut Butter', sub:'Flavoured', flavor:'Chocolate', weight:'500g', servings:25, servingSize:'20g', protein:8, price:689, badge:null, inStock:true, img:B+'pb-chocolate-crunchy.png', imgBg:'#e8d8cc', sku:'TOC-PBC-CR-500', description:'All the chocolate peanut butter goodness with satisfying crunchy roasted peanut pieces.', tags:['Real Cacao','Crunchy Texture','No Palm Oil','No Sucralose'], variantKey:'Crunchy', variantMap:{'Creamy':9,'Crunchy':10} },
  { name:'Cookie Blast Peanut Butter', category:'Peanut Butter', sub:'Signature', flavor:'Honey', weight:'500g', servings:25, servingSize:'20g', protein:8, price:689, badge:'New', inStock:true, img:B+'pb-cookies.png', imgBg:'#f0e8d8', sku:'TOC-PBS-CK-500', description:'Peanut butter with actual cookie chunks — not extract, not flavour. Made with Monk Fruit, no refined sugar.', tags:['Real Cookie Pieces','Monk Fruit','No Added Sugar','No Palm Oil'], variantKey:'Cookie Blast', variantMap:{'Cookie Blast':11,'Kulfi':12,'Mango Chia':14} },
  { name:'Kulfi Blast Peanut Butter', category:'Peanut Butter', sub:'Signature', flavor:'Vanilla', weight:'500g', servings:25, servingSize:'20g', protein:8, price:749, badge:null, inStock:true, img:B+'pb-kulfi.png', imgBg:'#ece0f0', sku:'TOC-PBS-KF-500', description:'Indian kulfi flavour meets clean peanut butter. Rose, cardamom, and pistachio notes — zero artificial flavours.', tags:['Rose & Cardamom','No Artificial Flavours','Monk Fruit','No Palm Oil'], variantKey:'Kulfi', variantMap:{'Cookie Blast':11,'Kulfi':12,'Mango Chia':14} },
  { name:'Organic Jaggery PB', category:'Peanut Butter', sub:'Natural', flavor:'Honey', weight:'500g', servings:25, servingSize:'20g', protein:8, price:679, badge:null, inStock:true, img:B+'pb-jaggery.png', imgBg:'#f0e8d0', sku:'TOC-PBN-JG-500', description:'Roasted peanuts sweetened with certified organic jaggery. No refined sugar, ever.', tags:['Organic Jaggery','No Refined Sugar','No Palm Oil','Traditional Recipe'], variantKey:'Jaggery', variantMap:{'Natural':8,'Jaggery':13} },
  { name:'Mango Chia Peanut Butter', category:'Peanut Butter', sub:'Signature', flavor:'Classic', weight:'500g', servings:25, servingSize:'20g', protein:8, price:749, badge:null, inStock:true, img:B+'pb-mango.png', imgBg:'#f5ecd0', sku:'TOC-PBS-MC-500', description:'Sun-dried Alphonso mango pieces, chia seeds, and clean peanuts. Omega-3 rich, naturally sweet.', tags:['Real Mango Pieces','Chia Seeds','Omega-3','No Added Sugar'], variantKey:'Mango Chia', variantMap:{'Cookie Blast':11,'Kulfi':12,'Mango Chia':14} },
  { name:'Orange Peanut Butter', category:'Peanut Butter', sub:'Signature', flavor:'Classic', weight:'500g', servings:25, servingSize:'20g', protein:8, price:689, badge:null, inStock:true, img:B+'pb-orange.png', imgBg:'#f5e8d0', sku:'TOC-PBS-OR-500', description:'Real orange zest and peanuts — a bright, zesty combination. No artificial flavours, no added sugar.', tags:['Real Orange Zest','No Artificial Flavours','No Added Sugar','No Palm Oil'], variantKey:'Orange', variantMap:{} },
  { name:'Shilajit Gold Resin', category:'Ayurvedic', sub:'Shilajit', flavor:'Classic', weight:'20g', servings:60, servingSize:'300mg', protein:null, price:1499, badge:null, inStock:true, img:B+'shilajit-gold-1.png', imgBg:'#e8e0d0', sku:'TOC-AYU-SG-20', description:'Himalayan Shilajit resin with 85+ trace minerals and 60%+ Fulvic Acid. Third-party tested for heavy metals.', tags:['60%+ Fulvic Acid','85+ Minerals','Heavy Metal Tested','No Fillers'], variantKey:'20g Resin', variantMap:{} },
  { name:'Apple Cider Tablets', category:'Ayurvedic', sub:'Apple Cider', flavor:'Classic', weight:'60 tab', servings:60, servingSize:'1 tablet', protein:null, price:620, badge:null, inStock:true, img:B+'apple-cider.png', imgBg:'#f0ece4', sku:'TOC-AYU-ACV-60', description:'Concentrated apple cider vinegar in a convenient tablet — no sour taste. With the Mother, standardised to 5% acetic acid.', tags:['With the Mother','5% Acetic Acid','No Filler','Lab Tested'], variantKey:'60 Tablets', variantMap:{} },
  { name:'Ashwagandha Capsules', category:'Ayurvedic', sub:'Adaptogen', flavor:'Unflavored', weight:'60 cap', servings:60, servingSize:'1 capsule', protein:null, price:549, badge:null, inStock:true, img:B+'ashwagandha.png', imgBg:'#e8f0e4', sku:'TOC-AYU-ASH-60', description:'KSM-66 Ashwagandha root extract standardised to 5% withanolides. Clinically researched adaptogen for stress, sleep, and recovery.', tags:['KSM-66 Extract','5% Withanolides','Vegan Capsules','No Fillers','Clinically Studied'], variantKey:'60 Capsules', variantMap:{} },
  { name:'Whole Grain Rice Cakes', category:'Essentials', sub:'Snacks', flavor:'Unflavored', weight:'130g', servings:13, servingSize:'10g', protein:null, price:190, badge:null, inStock:true, img:B+'rice-cakes.jpg', imgBg:'#f5f0e8', sku:'TOC-ESS-RC-130', description:'Light, crispy rice cakes with zero additives. Clean whole grain snack for any time of day.', tags:['Whole Grain','No Additives','Low Calorie','Gluten Free'], variantKey:'130g', variantMap:{} },
  { name:'Multivitamin for Men', category:'Essentials', sub:'Multivitamin', flavor:'Unflavored', weight:'60 tab', servings:60, servingSize:'1 tablet', protein:null, price:799, badge:null, inStock:true, img:B+'multivitamin-men.png', imgBg:'#e0eaf5', sku:'TOC-ESS-MVM-60', description:'Complete daily multivitamin formulated for men with 23 essential vitamins and minerals. No artificial colours.', tags:['23 Vitamins & Minerals','No Artificial Colours','Lab Tested','Vegan'], variantKey:'60 Tablets', variantMap:{'Men':20,'Women':21} },
  { name:'Multivitamin for Women', category:'Essentials', sub:'Multivitamin', flavor:'Unflavored', weight:'60 tab', servings:60, servingSize:'1 tablet', protein:null, price:799, badge:null, inStock:true, img:B+'multivitamin-women.png', imgBg:'#f5e0ea', sku:'TOC-ESS-MVW-60', description:'Complete daily multivitamin formulated for women with iron, folate, and biotin. Supports hormonal balance.', tags:['Iron & Folate','Hormonal Support','No Artificial Colours','Lab Tested'], variantKey:'Women', variantMap:{'Men':20,'Women':21} },
];

async function seed() {
  await init();

  const { rows: adminRows } = await client.execute('SELECT COUNT(*) as c FROM admin_users');
  if (Number(adminRows[0].c) === 0) {
    await client.execute({
      sql: 'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
      args: ['admin@theorganiccosmos.com', bcrypt.hashSync('Admin@TOC2025', 12), 'TOC Admin'],
    });
    console.log('  ✓ Admin created  →  admin@theorganiccosmos.com / Admin@TOC2025');
  } else {
    console.log('  · Admin already exists — skipping');
  }

  const { rows: countRows } = await client.execute('SELECT COUNT(*) as c FROM products');
  if (Number(countRows[0].c) > 0) {
    console.log(`  · ${countRows[0].c} products already in DB — skipping seed`);
    return;
  }

  for (const p of products) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO products
        (name,category,sub,flavor,weight,servings,serving_size,protein,price,badge,in_stock,img,img_bg,sku,description,tags,variant_key,variant_map)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        p.name, p.category, p.sub || null, p.flavor,
        p.weight || null, p.servings || 0, p.servingSize || null, p.protein || null,
        p.price, p.badge || null, p.inStock ? 1 : 0,
        p.img || null, p.imgBg || '#f0ede4', p.sku || null, p.description || null,
        JSON.stringify(p.tags || []), p.variantKey || null, JSON.stringify(p.variantMap || {}),
      ],
    });
  }

  console.log(`  ✓ ${products.length} products seeded`);
  console.log('\nSetup complete.\n');
}

seed().catch(err => { console.error(err); process.exit(1); });
