def notes_prompt(topic, mode):

    return f"""
    Generate {mode} notes on:

    {topic}

    clear structured format
    """


def question_prompt(topic, qtype, number):

    return f"""
    Generate {number} {qtype} questions on:

    {topic}

    with answers
    """
