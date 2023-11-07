const expect = require('chai').expect
const { TransientMap } = require('../test-lib/index')

describe('TransientMap', () => {
  it('params parsing', () => {
    const m1 = new TransientMap();
    expect(m1.maxSize).to.equal(10000); 
    expect(m1.sliceCount).to.equal(2); 

    const m2 = new TransientMap(Object.entries({a:1,b:2}));
    expect(m2.maxSize).to.equal(10000); 
    expect(m2.sliceCount).to.equal(2); 
    expect(m2.size).to.equal(2); 

    const m3 = new TransientMap(Object.entries({a:1,b:2}), 10, 5);
    expect(m3.maxSize).to.equal(10); 
    expect(m3.sliceCount).to.equal(5); 
    expect(m3.size).to.equal(2); 

    const m4 = new TransientMap(10, 5);
    expect(m4.maxSize).to.equal(10); 
    expect(m4.sliceCount).to.equal(5); 
    expect(m4.size).to.equal(0); 
  })
  it('maxSize param should work', () => {
    const m = new TransientMap(10);
    expect(m.size).to.equal(0); 
    for (let i=0;i<10;i++) m.set(`k${i}`, i); 
    // slices: [5, <current> 5] (default slice count = 2)
    expect(m.size).to.equal(10); 

    for (let i=10;i<11;i++) m.set(`k${i}`, i); 
    // exceed maxSize
    // slices: [<current> 1, 5]
    for (let i=0;i<5;i++) expect(m.has(`k${i}`)).to.equal(false);
    for (let i=5;i<11;i++) expect(m.get(`k${i}`)).to.equal(i);
    expect(m.size).to.equal(6); 

    for (let i=11;i<15;i++) m.set(`k${i}`, i); 
    // slices: [5, <current> 5]
    expect(m.size).to.equal(10); 
  })
  it('sliceCount param should work', () => {
    const m = new TransientMap(8, 4);
    expect(m.size).to.equal(0); 
    for (let i=0;i<8;i++) m.set(`k${i}`, i); 
    // slices: [2, 2, 2, <current> 2]
    expect(m.size).to.equal(8); 

    for (let i=8;i<9;i++) m.set(`k${i}`, i); 
    // slices: [<current> 1, 2, 2, 2]
    expect(m.size).to.equal(7); 
    for (let i=0;i<2;i++) expect(m.has(`k${i}`)).to.equal(false);
    for (let i=2;i<9;i++) expect(m.get(`k${i}`)).to.equal(i);
  })
  it('changing of maxSize in runtime', () => {
    const m = new TransientMap(8, 4);
    expect(m.size).to.equal(0); 
    for (let i=0;i<8;i++) m.set(`k${i}`, i); 
    // slices: [2, 2, 2, <current> 2]
    expect(m.size).to.equal(8); 

    for (let i=8;i<9;i++) m.set(`k${i}`, i); 
    // slices: [<current> 1, 2, 2, 2]
    expect(m.size).to.equal(7); 
    for (let i=0;i<2;i++) expect(m.has(`k${i}`)).to.equal(false);
    for (let i=2;i<9;i++) expect(m.get(`k${i}`)).to.equal(i);

    m.maxSize = 80
    for (let i=9;i<9 + 80 - 1 /*1 => first slot : 1*/;i++) m.set(`k${i}`, i); 
    expect(m.size).to.equal(80); 
    m.set('onemore', 'thing')
    expect(m.size).to.equal(61)
  })
  it('keep insert order', () => {
    const m = new TransientMap(10);
    for (let i=0;i<10;i++) m.set(`k${i}`, i); 
    expect(m.entries().map(e => e[1]).join('')).to.equal('0123456789'); 
    m.set(`A`, 'A'); 
    expect(m.entries().map(e => e[1]).join('')).to.equal('56789A');
    for (let i='B';i<='J';i = String.fromCharCode(i.charCodeAt(0) + 1)) m.set(i, i); 
    expect(m.entries().map(e => e[1]).join('')).to.equal('ABCDEFGHIJ');
  })
})
