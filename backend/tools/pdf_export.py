from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def export_pdf(text, filename):

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    doc.build([Paragraph(text, styles["Normal"])])
