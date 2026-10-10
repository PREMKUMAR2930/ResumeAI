import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from ..models.schemas import InterviewResults

def generate_pdf_report(results: InterviewResults) -> io.BytesIO:
    """
    Generates a professional PDF interview report using ReportLab.
    Returns BytesIO stream.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#1e293b")
    indigo_accent = colors.HexColor("#4f46e5")
    gray_sub = colors.HexColor("#64748b")
    card_bg = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#e2e8f0")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=gray_sub,
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=indigo_accent,
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    ideal_ans_style = ParagraphStyle(
        'IdealAns',
        parent=body_style,
        fontName='Helvetica-Oblique',
        textColor=colors.HexColor("#1e40af")
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("InterviewReady AI — Performance Report", title_style))
    elements.append(Paragraph(f"Autonomous Resume-Based Technical Evaluation | Generated: {datetime.now().strftime('%b %d, %Y - %H:%M')}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=indigo_accent, spaceBefore=0, spaceAfter=12))

    # Candidate & Session Overview Info Grid
    info_data = [
        [
            Paragraph("<b>Candidate:</b>", body_style),
            Paragraph(results.candidate_name, bold_body_style),
            Paragraph("<b>Overall Score:</b>", body_style),
            Paragraph(f"<font color='#4f46e5' size='12'><b>{results.overall_score} / 100</b></font>", bold_body_style)
        ],
        [
            Paragraph("<b>Target Role:</b>", body_style),
            Paragraph(results.role, body_style),
            Paragraph("<b>Questions Answered:</b>", body_style),
            Paragraph(f"{results.total_questions_answered} of {results.total_questions_planned}", body_style)
        ],
        [
            Paragraph("<b>Difficulty / Type:</b>", body_style),
            Paragraph(f"{results.difficulty} ({results.interview_type})", body_style),
            Paragraph("<b>AI Engine Used:</b>", body_style),
            Paragraph(results.ai_provider_used, body_style)
        ]
    ]
    info_table = Table(info_data, colWidths=[110, 160, 120, 140])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), card_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 10))

    # Scoring Breakdown Rubric Table
    elements.append(Paragraph("Score Evaluation Rubric Breakdown", h2_style))
    rubric_data = [
        [
            Paragraph("<b>Correctness (0-40)</b>", bold_body_style),
            Paragraph("<b>Relevance (0-25)</b>", bold_body_style),
            Paragraph("<b>Clarity (0-20)</b>", bold_body_style),
            Paragraph("<b>Practical (0-15)</b>", bold_body_style),
            Paragraph("<b>Overall (0-100)</b>", bold_body_style)
        ],
        [
            Paragraph(f"{results.correctness_score} / 40", body_style),
            Paragraph(f"{results.relevance_score} / 25", body_style),
            Paragraph(f"{results.clarity_score} / 20", body_style),
            Paragraph(f"{results.practical_score} / 15", body_style),
            Paragraph(f"<b>{results.overall_score} %</b>", bold_body_style)
        ]
    ]
    rubric_table = Table(rubric_data, colWidths=[106, 106, 106, 106, 106])
    rubric_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(rubric_table)
    elements.append(Spacer(1, 10))

    # Topic Breakdown
    if results.topic_breakdown:
        elements.append(Paragraph("Topic-Wise Performance", h2_style))
        topic_rows = [[
            Paragraph("<b>Topic</b>", bold_body_style),
            Paragraph("<b>Questions</b>", bold_body_style),
            Paragraph("<b>Correctness</b>", bold_body_style),
            Paragraph("<b>Relevance</b>", bold_body_style),
            Paragraph("<b>Score</b>", bold_body_style),
        ]]
        for t in results.topic_breakdown:
            topic_rows.append([
                Paragraph(t.topic, body_style),
                Paragraph(str(t.questions_count), body_style),
                Paragraph(f"{t.correctness_avg}/40", body_style),
                Paragraph(f"{t.relevance_avg}/25", body_style),
                Paragraph(f"<b>{t.score}%</b>", bold_body_style),
            ])
        topic_table = Table(topic_rows, colWidths=[180, 75, 95, 95, 85])
        topic_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(topic_table)
        elements.append(Spacer(1, 10))

    # Detailed Q&A Review
    elements.append(Paragraph("Detailed Question Evaluation History", h2_style))
    for idx, item in enumerate(results.qa_history, 1):
        q_text = item.question.question_text
        q_topic = item.question.topic
        q_diff = item.question.difficulty.value
        ans_text = item.answer or "(No answer provided)"
        
        eval_score = f"{item.evaluation.score}/100" if item.evaluation else "N/A"
        strengths = ", ".join(item.evaluation.strengths) if item.evaluation and item.evaluation.strengths else "N/A"
        improvements = ", ".join(item.evaluation.improvements) if item.evaluation and item.evaluation.improvements else "N/A"
        ideal_ans = item.evaluation.ideal_answer if item.evaluation else "N/A"

        qa_box = [
            [Paragraph(f"<b>Q{idx} [{q_topic} - {q_diff}]:</b> {q_text}", bold_body_style)],
            [Paragraph(f"<b>Candidate Answer:</b> {ans_text}", body_style)],
            [Paragraph(f"<b>Score:</b> {eval_score} | <b>Strengths:</b> {strengths}", body_style)],
            [Paragraph(f"<b>Areas for Growth:</b> {improvements}", body_style)],
            [Paragraph(f"<b>Ideal Model Answer:</b> {ideal_ans}", ideal_ans_style)]
        ]
        qa_table = Table(qa_box, colWidths=[530])
        qa_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), card_bg),
            ('BOX', (0, 0), (-1, -1), 1, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(KeepTogether([qa_table, Spacer(1, 8)]))

    # Career Coach Improvement Roadmap
    if results.career_plan:
        elements.append(Paragraph("Personalized Career & Improvement Roadmap", h2_style))
        elements.append(Paragraph(results.career_plan.overall_assessment, body_style))
        elements.append(Spacer(1, 6))

        for prio in results.career_plan.priorities:
            prio_data = [
                [Paragraph(f"<b>Priority {prio.priority_level}: {prio.topic}</b>", bold_body_style)],
                [Paragraph(f"<b>Key Concepts to Review:</b> {', '.join(prio.key_concepts_to_review)}", body_style)],
                [Paragraph(f"<b>Action Items:</b> {'; '.join(prio.action_items)}", body_style)],
                [Paragraph(f"<b>Hands-On Practice:</b> {'; '.join(prio.practical_exercises)}", body_style)]
            ]
            prio_table = Table(prio_data, colWidths=[530])
            prio_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ]))
            elements.append(KeepTogether([prio_table, Spacer(1, 6)]))

    # Disclaimer Footer
    elements.append(Spacer(1, 10))
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Italic'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94a3b8")
    )
    elements.append(Paragraph(
        f"Disclaimer: {results.disclaimer} "
        "Generated exclusively for academic preparation and practice purposes via InterviewReady AI.",
        disclaimer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
