const mongoose        = require('mongoose')
const marked          = require('marked')
const slugify         = require('slugify')
const router          = require('../routes/articles')
const createDomPurify = require('dompurify')
const { JSDOM }       = require('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

// Pre-Validate
articleSchema.pre('validate', function(next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }

    // NOTE: 54:25
    // https://www.youtube.com/watch?v=1NrHkjlWVhM
    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
    }

    next()
})

router.delete('/:id', async (req, res) => {
    await articleSchema.findByIdAndDelete(req.params.id)
    res.redirect('/')
})

module.exports = mongoose.model('Article', articleSchema)