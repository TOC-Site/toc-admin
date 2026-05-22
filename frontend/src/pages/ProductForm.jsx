import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { api } from '../api.js';

const EMPTY = {
  name: '', category: 'Sports Nutrition', sub: '', flavor: 'Unflavored',
  weight: '', servings: '', servingSize: '', protein: '', price: '',
  badge: '', inStock: true, img: '', imgBg: '#f0ede4', sku: '',
  description: '', tags: [], variantKey: '', variantMap: {},
};

const CATEGORIES  = ['Sports Nutrition', 'Oats & Breakfast', 'Peanut Butter', 'Ayurvedic', 'Essentials'];
const FLAVORS     = ['Unflavored', 'Chocolate', 'Vanilla', 'Strawberry', 'Honey', 'Classic', 'Mango', 'Coffee'];
const BADGES      = ['', 'Bestseller', 'Top Rated', 'New', 'Sale'];

export default function ProductForm() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);
  const fileRef   = useRef();

  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [toast,      setToast]      = useState(null);
  const [tagInput,   setTagInput]   = useState('');
  const [vmKey,      setVmKey]      = useState('');
  const [vmVal,      setVmVal]      = useState('');

  useEffect(() => {
    if (isEdit) {
      api.getProduct(id).then(p => setForm({
        ...EMPTY, ...p,
        tags:      Array.isArray(p.tags) ? p.tags : [],
        variantMap: typeof p.variantMap === 'object' ? p.variantMap : {},
      })).catch(err => showToast(err.message, 'error'));
    }
  }, [id]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!form.price)        e.price = 'Price is required';
    if (!form.category)     e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await api.updateProduct(id, form);
        showToast('Product updated successfully');
      } else {
        const created = await api.createProduct(form);
        showToast('Product created successfully');
        setTimeout(() => navigate(`/products/${created.id}/edit`), 1000);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      set('img', url);
      showToast('Image uploaded');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { set('tags', [...form.tags, t]); }
    setTagInput('');
  };

  const removeTag = tag => set('tags', form.tags.filter(t => t !== tag));

  const addVariant = () => {
    if (!vmKey.trim() || !vmVal.trim()) return;
    set('variantMap', { ...form.variantMap, [vmKey.trim()]: Number(vmVal) || vmVal.trim() });
    setVmKey(''); setVmVal('');
  };

  const removeVariant = key => {
    const m = { ...form.variantMap };
    delete m[key];
    set('variantMap', m);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f2ee' }}>
      <Sidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a68', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back
          </button>
          <div style={{ width: 1, height: 20, background: '#ddd9d0' }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0e0e0e', letterSpacing: '-0.02em' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Basic Info */}
              <Section title="Basic Information">
                <Row>
                  <Field label="Product Name *" error={errors.name}>
                    <Input value={form.name} onChange={v => set('name', v)} placeholder="e.g. Clean Whey Protein" error={errors.name} />
                  </Field>
                  <Field label="SKU">
                    <Input value={form.sku} onChange={v => set('sku', v)} placeholder="TOC-CWP-BC-1K" mono />
                  </Field>
                </Row>
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={4}
                    placeholder="Short product description…"
                    style={{ width: '100%', borderRadius: 10, border: '1.5px solid #e0dcd4', padding: '10px 14px', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, background: '#faf9f7' }}
                  />
                </Field>
              </Section>

              {/* Classification */}
              <Section title="Classification">
                <Row>
                  <Field label="Category *" error={errors.category}>
                    <Select value={form.category} onChange={v => set('category', v)} options={CATEGORIES} />
                  </Field>
                  <Field label="Sub-category">
                    <Input value={form.sub} onChange={v => set('sub', v)} placeholder="e.g. Whey, Raw Whey, Natural" />
                  </Field>
                </Row>
                <Row>
                  <Field label="Flavour">
                    <Select value={form.flavor} onChange={v => set('flavor', v)} options={FLAVORS} />
                  </Field>
                  <Field label="Badge">
                    <Select value={form.badge} onChange={v => set('badge', v)} options={BADGES} emptyLabel="No Badge" />
                  </Field>
                </Row>
              </Section>

              {/* Specs */}
              <Section title="Product Specs">
                <Row cols={3}>
                  <Field label="Weight / Volume">
                    <Input value={form.weight} onChange={v => set('weight', v)} placeholder="1 KG" />
                  </Field>
                  <Field label="Servings">
                    <Input value={form.servings} onChange={v => set('servings', v)} placeholder="30" type="number" />
                  </Field>
                  <Field label="Serving Size">
                    <Input value={form.servingSize} onChange={v => set('servingSize', v)} placeholder="33g" />
                  </Field>
                </Row>
                <Row>
                  <Field label="Protein per Serving (g)">
                    <Input value={form.protein} onChange={v => set('protein', v)} placeholder="24" type="number" />
                  </Field>
                  <Field label="Price (₹) *" error={errors.price}>
                    <Input value={form.price} onChange={v => set('price', v)} placeholder="4600" type="number" error={errors.price} />
                  </Field>
                </Row>
                <Row>
                  <Field label="Variant Key (current flavour label)">
                    <Input value={form.variantKey} onChange={v => set('variantKey', v)} placeholder="Brew Café" />
                  </Field>
                  <Field label="Image Background Color">
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.imgBg || '#f0ede4'} onChange={e => set('imgBg', e.target.value)}
                        style={{ width: 40, height: 36, borderRadius: 8, border: '1.5px solid #e0dcd4', padding: 3, cursor: 'pointer' }} />
                      <Input value={form.imgBg} onChange={v => set('imgBg', v)} placeholder="#f0ede4" mono />
                    </div>
                  </Field>
                </Row>
              </Section>

              {/* Tags */}
              <Section title="Feature Tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: form.tags.length ? 10 : 0 }}>
                  {form.tags.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: '#e8f5e0', border: '1px solid #c8e0b8', fontSize: 12, fontWeight: 500, color: '#1a4a0a' }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6a9a5a', lineHeight: 1, padding: 0, fontSize: 14, display: 'flex' }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Type a tag and press Enter or Add"
                    style={{ flex: 1, height: 38, borderRadius: 9, border: '1.5px solid #e0dcd4', padding: '0 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#faf9f7' }}
                  />
                  <button type="button" onClick={addTag} style={{ height: 38, padding: '0 16px', borderRadius: 9, border: '1.5px solid #154913', background: 'transparent', color: '#154913', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                </div>
              </Section>

              {/* Variant Map */}
              <Section title="Variant Map (Flavour Navigation)">
                <p style={{ fontSize: 12, color: '#9a9a88', marginBottom: 12 }}>Map flavour labels to product IDs so users can switch between variants.</p>
                {Object.entries(form.variantMap).length > 0 && (
                  <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(form.variantMap).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, background: '#f5f3ef', border: '1px solid #e8e4dc' }}>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#1a1a14' }}>{key}</span>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#7a7a68' }}>→ ID {val}</span>
                        <button type="button" onClick={() => removeVariant(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={vmKey} onChange={e => setVmKey(e.target.value)} placeholder="Label (e.g. Brew Café)"
                    style={{ flex: 2, height: 38, borderRadius: 9, border: '1.5px solid #e0dcd4', padding: '0 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#faf9f7' }} />
                  <input value={vmVal} onChange={e => setVmVal(e.target.value)} placeholder="Product ID"
                    style={{ flex: 1, height: 38, borderRadius: 9, border: '1.5px solid #e0dcd4', padding: '0 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#faf9f7' }} />
                  <button type="button" onClick={addVariant} style={{ height: 38, padding: '0 16px', borderRadius: 9, border: '1.5px solid #154913', background: 'transparent', color: '#154913', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
                </div>
              </Section>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 20 }}>

              {/* Publish / Status */}
              <Section title="Status">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: form.inStock ? '#f0faf0' : '#fff5f5', border: `1.5px solid ${form.inStock ? '#c8e8c0' : '#fecaca'}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.inStock ? '#166534' : '#991b1b' }}>{form.inStock ? 'In Stock' : 'Out of Stock'}</div>
                    <div style={{ fontSize: 11, color: '#9a9a88', marginTop: 1 }}>Visible in shop</div>
                  </div>
                  <div
                    onClick={() => set('inStock', !form.inStock)}
                    style={{ width: 44, height: 24, borderRadius: 12, background: form.inStock ? '#154913' : '#d4c9b0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}
                  >
                    <div style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s', left: form.inStock ? 23 : 3 }} />
                  </div>
                </div>
              </Section>

              {/* Image */}
              <Section title="Product Image">
                {/* Preview */}
                <div style={{ width: '100%', height: 180, borderRadius: 12, background: form.imgBg || '#f0ede4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden', border: '1px solid #e8e4dc' }}>
                  {form.img ? (
                    <img src={form.img} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 12 }}
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#b0a898' }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>🖼️</div>
                      <div style={{ fontSize: 12 }}>No image yet</div>
                    </div>
                  )}
                </div>

                {/* URL input */}
                <Field label="Image URL">
                  <Input value={form.img} onChange={v => set('img', v)} placeholder="/product-images/whey.png" />
                </Field>

                {/* Upload */}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ width: '100%', height: 38, borderRadius: 9, border: '1.5px dashed #d4c9b0', background: 'transparent', color: uploading ? '#9a9a88' : '#4a4a3a', fontSize: 13, fontWeight: 500, cursor: uploading ? 'wait' : 'pointer', fontFamily: 'inherit', marginTop: 8 }}
                >
                  {uploading ? 'Uploading…' : '⬆ Upload Image'}
                </button>
              </Section>

              {/* Summary */}
              {form.name && (
                <Section title="Summary">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      ['Name',     form.name],
                      ['Category', form.category],
                      ['Price',    form.price ? `₹${Number(form.price).toLocaleString('en-IN')}` : '—'],
                      ['Tags',     form.tags.length ? `${form.tags.length} tags` : '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#9a9a88' }}>{k}</span>
                        <span style={{ color: '#1a1a14', fontWeight: 500, textAlign: 'right', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                style={{ width: '100%', height: 48, borderRadius: 12, border: 'none', background: saving ? '#6aa358' : '#154913', color: '#fff', fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              >
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                style={{ width: '100%', height: 42, borderRadius: 12, border: '1.5px solid #e0dcd4', background: 'transparent', color: '#7a7a68', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: toast.type === 'error' ? '#1a0a0a' : '#0e1f0b',
          color: toast.type === 'error' ? '#fca5a5' : '#a5d490',
          padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)', animation: 'slideUp 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eae6de', padding: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9a9a88', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}

function Row({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: error ? '#dc2626' : '#4a4a3a', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', error, mono, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', height: 38, borderRadius: 9, padding: '0 12px', fontSize: 13,
        border: `1.5px solid ${error ? '#fca5a5' : focused ? '#154913' : '#e0dcd4'}`,
        background: '#faf9f7', outline: 'none', fontFamily: mono ? 'DM Mono, monospace' : 'inherit',
        color: '#1a1a14', transition: 'border-color 0.15s',
      }}
    />
  );
}

function Select({ value, onChange, options, emptyLabel }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', height: 38, borderRadius: 9, border: '1.5px solid #e0dcd4', padding: '0 12px', fontSize: 13, background: '#faf9f7', color: '#1a1a14', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
    >
      {emptyLabel && <option value="">{emptyLabel}</option>}
      {options.map(o => <option key={o} value={o}>{o || '(none)'}</option>)}
    </select>
  );
}
