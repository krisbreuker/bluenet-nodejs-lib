

let b = Buffer.alloc(8);
b.writeUInt32BE(0xff99dd00, 0)
b.writeUInt32BE(0xaa99ffc0, 4)

let a = b.slice(0,2)
console.log(b, a)