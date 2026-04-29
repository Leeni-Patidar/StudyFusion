from docx import Document

def export_docx(text, filename):

    doc = Document()

    doc.add_paragraph(text)

    doc.save(filename)
