const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({
    filename: { type: String},
    originalName: { type: String},
    controlNumber: { type: String, unique: true},
    fullName: { type: String},
    career: { type: String},
    nss: { type: String },
    nip: { type: String },    
    documents:[
        { filename: { type: String}, releaseDate: { type: Date}, type: { type: String}, status:{type: String} }
    ],
    idRole: { type: mongoose.Schema.Types.ObjectId, ref:'Role'}
});

const studentModel = mongoose.model('Student', studentSchema, 'students');

module.exports = studentModel;

// _student.findOne({controlNumber:item.controlNumber}, (error, student)=>{
//     if(error)
//         throw error;
//     if(!student){
//          _student.create(item);
//     }
//     else{      
//         const _doc=item.document;             
//         console.log("documento",_doc);
//         const query={ _id : student._id,documents:{$elemMatch:{type:_doc.type}}};    
//         const push={ $push : { documents: _doc }};
//         _student.findOne(query,(e,studentDoc)=>{   
//             let a=1/0;     
//             if(e)
//                 throw e;
//             if(studentDoc){
//                 _student.findOneAndUpdate(query,{$set:{"documents.$.status":_doc.status, "documents.$.releaseDate":new Date()}},{new:true})
//                 .then(student=>{                                                                                  
//                     _newRegister.push(student);
//                     console.log("register",_newRegister);
//                 }).catch(err=>{
//                     throw err;
//                 })                        
//             }else{
//                 _student.findOneAndUpdate({ _id : _id},push,{new:true}).then(student=>{
//                     _newRegister.push(student);
//                 }).catch(err=>{
//                     throw err;
//                 });
//             }
//         });    
//     }
// });