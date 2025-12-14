const Object = require('../model/object.model');
const Document = require('../model/document.model');
const { importDate } = require('../../util/importDate');
class ObjectController {

    /** [GET] /objects */
    async index(req, res) {
        try {
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const object = await Object.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .populate('parentId')
                .sort({createdAt: -1})
                .lean();
                const objectFormat = object.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchObject: objectFormat,
                }
                return res.status(200).json({data})
            }
            const object = await Object.find()
            .populate('parentId')
            .sort({createdAt: -1})
            .lean();
    
            const objectFormat = object.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const data = {
                objectFormat,
                searchType: false,
            }
            return res.status(200).json({data});
        }catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

    /** [POST] /objects/add */
    async add(req, res) {
        try {
            console.log(req.body)
            const {name, stt, thumbnail, parentId, description, slug, active} =  req.body;
            if(!name) {
                return res.status(400).json({ 
                    message: 'Tên môn học không được để trống!' 
                });
            }
            const exitName = await Object.findOne({ name: name });
            if(exitName) {
                return res.status(400).json({ message: 'Tên môn học đã tồn tại, vui lòng chọn tên khác!' }); 
            }
            if(!thumbnail) {
                return res.status(400).json({ 
                    message: 'Vui lòng chọn ảnh!' 
                });
            }
            if(!slug) {
                return res.status(400).json({ 
                    message: 'Đường dẫn không được để trống!' 
                });
            }
            const newObject = new Object({
                name,
                stt: stt || 9999,
                thumbnail,
                active: active ? active : "yes",
                parentId: parentId || null,
                description: description || null,
                slug,
            });
            await newObject.save();
            return res.status(200).json({ 
                message: 'Thêm môn học thành công!'
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

    /** [GET] /objects/:slug */
    async detail(req, res) {
        try{
            const slug = req.params.slug;
            if(!slug){
                return res.status(400).json({ 
                    message: 'Môn học không tồn tại' 
                });
            }
            const object = await Object.findOne({ slug: slug })
            .populate('parentId')
            .lean();
            if(!object){
                return res.status(404).json({ 
                    message: 'Môn học không tồn tại' 
                });
            }
            const documents = await Document.find({ objectId: object._id })
            .populate('objectId')
            .sort({ createdAt: -1 })
            .lean();
            res.status(200).json({ object, documents });
        }catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

    /** [PUT] /objects/:slug */
    async update(req, res) {
        try {
            const slug = req.params.slug;
            const { name, stt, thumbnail, parentId, description, newSlug } = req.body;
            const object = await Object.findOne({ slug: slug });
            if (!object) {
                return res.status(404).json({ message: 'Môn học không tồn tại!' });
            }
            if (!name) {
                return res.status(400).json({ message: 'Tên môn học không được để trống!' });
            }
            if (!thumbnail) {
                return res.status(400).json({ message: 'Vui lòng chọn ảnh!' });
            }
            const existingSlug = await Object.findOne({ slug: newSlug });
            if (existingSlug && newSlug !== slug) {
                return res.status(400).json({ message: 'Đường dẫn đã tồn tại, vui lòng chọn đường dẫn khác!' });
            }
            const exitName = await Object.findOne({ name: name });
            if (exitName && name !== object.name) {
                return res.status(400).json({ message: 'Tên môn học đã tồn tại, vui lòng chọn tên khác!' });
            }
            await Object.updateOne(
                { slug: slug },
                {
                    name,
                    thumbnail,
                    stt: stt || 9999,
                    parentId: parentId || null,
                    description: description || null,
                    slug: newSlug || slug,
                }
            );
            return res.status(200).json({ message: 'Cập nhật môn học thành công!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

    /** [DELETE] /objects/:slug */
    async delete(req, res) {
        try {
            const slug = req.params.slug;
            const object = await Object.findOne({ slug: slug });
            if (!object) {
                return res.status(404).json({ message: 'Môn học không tồn tại!' });
            }
            await Object.deleteOne({ slug: slug });
            return res.status(200).json({ message: 'Xóa môn học thành công!' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

    /** [DELETE] /objects/delete-many */
    async deleteMany(req, res) {
        try {
            const { slugs } = req.body;
            if(!slugs || !Array.isArray(slugs) || slugs.length === 0) {
                return res.status(400).json({ message: 'Môn học không tồn tại!' });
            }
            await Object.deleteMany({ slug: { $in: slugs } });
            const object = await Object.find()
            .sort({createdAt: -1})
            .lean();
    
            const objectFormat = object.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            return res.status(200).json({ 
                message: 'Xóa nhiều môn học thành công!',
                object: objectFormat
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new ObjectController();